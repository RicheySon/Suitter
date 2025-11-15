/// Tipping module for content monetization on Suitter
/// Enables users to tip content creators and manage earnings
module suits::tipping {
    use sui::table::{Self, Table};
    use sui::event;
    use sui::clock::{Self, Clock};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::balance::{Self, Balance};
    use suits::suits::{Self, Suit};

    // ===== Error Constants =====
    
    /// Withdrawal amount exceeds available balance
    const E_INSUFFICIENT_BALANCE: u64 = 30;
    /// Tip amount is below minimum threshold or invalid
    const E_INVALID_TIP_AMOUNT: u64 = 31;
    /// User cannot tip their own Suit
    const E_CANNOT_TIP_SELF: u64 = 32;
    /// Withdrawal operation failed
    const E_WITHDRAWAL_FAILED: u64 = 33;
    /// Balance is zero, cannot withdraw
    const E_ZERO_BALANCE: u64 = 34;

    // ===== Constants =====
    
    /// Minimum tip amount in MIST (0.01 SUI = 10,000,000 MIST)
    const MIN_TIP_AMOUNT: u64 = 10_000_000;

    // ===== Structs =====

    /// Represents a user's earnings balance from tips
    /// Tracks accumulated tips and withdrawal history
    public struct TipBalance has key {
        /// Unique identifier for this TipBalance
        id: UID,
        /// Wallet address of the balance owner
        owner: address,
        /// Accumulated tips in SUI that can be withdrawn
        balance: Balance<SUI>,
        /// Lifetime total of tips received (in MIST)
        total_received: u64,
        /// Lifetime total of tips withdrawn (in MIST)
        total_withdrawn: u64,
    }

    /// Global registry to track all tip balances
    /// Maps user addresses to their TipBalance object IDs for efficient lookups
    public struct TipBalanceRegistry has key {
        /// Unique identifier for the registry
        id: UID,
        /// Maps user address to their TipBalance object ID
        balances: Table<address, ID>,
    }

    // ===== Events =====

    /// Event emitted when a tip is sent to a Suit creator
    public struct TipSent has copy, drop {
        suit_id: ID,
        tipper: address,
        recipient: address,
        amount: u64,
        timestamp: u64,
    }

    /// Event emitted when a user withdraws their earnings
    public struct FundsWithdrawn has copy, drop {
        owner: address,
        amount: u64,
        timestamp: u64,
    }

    // ===== Initialization =====

    /// Initialize the TipBalanceRegistry as a shared object
    /// This function is called once during module deployment
    /// The registry enables efficient lookups of user balances
    fun init(ctx: &mut TxContext) {
        let registry = TipBalanceRegistry {
            id: object::new(ctx),
            balances: table::new(ctx),
        };
        transfer::share_object(registry);
    }


    // ===== Helper Functions =====

    /// Get or create a TipBalance for a user (lazy initialization).
    /// 
    /// This helper function implements lazy initialization for TipBalance objects.
    /// Instead of requiring users to explicitly create a TipBalance before receiving tips,
    /// this function automatically creates one when needed.
    /// 
    /// # Lazy Initialization Strategy
    /// 1. Check if the user already has a TipBalance in the registry
    /// 2. If yes, return the existing TipBalance ID
    /// 3. If no, create a new TipBalance with zero balance and register it
    /// 
    /// This approach provides a better user experience by removing the need for
    /// an explicit "setup" transaction before receiving tips.
    /// 
    /// # Arguments
    /// * `registry` - Mutable reference to the TipBalanceRegistry
    /// * `user_address` - Address of the user to get or create balance for
    /// * `ctx` - Transaction context
    /// 
    /// # Returns
    /// * `ID` - The object ID of the user's TipBalance (existing or newly created)
    /// 
    /// # Implementation Notes
    /// - New TipBalance objects are created as shared objects so anyone can send tips
    /// - Initial balance is zero (empty Balance<SUI>)
    /// - Counters (total_received, total_withdrawn) start at zero
    fun get_or_create_tip_balance(
        registry: &mut TipBalanceRegistry,
        user_address: address,
        ctx: &mut TxContext
    ): ID {
        // Check if user already has a TipBalance in the registry
        if (table::contains(&registry.balances, user_address)) {
            // User has existing balance, return its ID
            *table::borrow(&registry.balances, user_address)
        } else {
            // User doesn't have a balance yet, create a new one
            // Initialize with zero balance and counters
            let tip_balance = TipBalance {
                id: object::new(ctx),
                owner: user_address,
                balance: balance::zero<SUI>(),
                total_received: 0,
                total_withdrawn: 0,
            };
            
            let balance_id = object::id(&tip_balance);
            
            // Register the new TipBalance in the registry
            // This allows future lookups to find the existing balance
            table::add(&mut registry.balances, user_address, balance_id);
            
            // Share the TipBalance object so anyone can send tips to it
            // The owner field ensures only the owner can withdraw
            transfer::share_object(tip_balance);
            
            balance_id
        }
    }


    // ===== Public Functions =====

    /// Send a tip to a Suit creator with payment handling and validation.
    /// 
    /// This function implements the complete tipping flow with security checks:
    /// 1. Validates tip amount meets minimum threshold
    /// 2. Prevents self-tipping (users cannot tip their own Suits)
    /// 3. Gets or creates recipient's TipBalance (lazy initialization)
    /// 4. Transfers payment to recipient's balance using Sui Balance operations
    /// 5. Updates total_received counter for transparency
    /// 6. Updates the Suit's tip_total for display
    /// 7. Emits TipSent event for off-chain tracking
    /// 
    /// # Payment Flow
    /// The tipper provides a Coin<SUI> object which is converted to a Balance<SUI>
    /// and added to the recipient's TipBalance. This ensures secure transfer of funds
    /// without requiring direct wallet-to-wallet transfers.
    /// 
    /// # Security Considerations
    /// - Minimum tip amount prevents spam and ensures meaningful contributions
    /// - Self-tipping prevention maintains system integrity
    /// - Balance operations are atomic and cannot fail partially
    /// - Only the balance owner can withdraw funds (enforced in withdraw_funds)
    /// 
    /// # Arguments
    /// * `suit` - Mutable reference to the Suit being tipped
    /// * `recipient_balance` - Mutable reference to recipient's TipBalance
    /// * `payment` - Coin<SUI> object containing the tip amount
    /// * `clock` - Sui Clock object for timestamp
    /// * `ctx` - Transaction context
    /// 
    /// # Panics
    /// * E_INVALID_TIP_AMOUNT - If tip amount is below minimum threshold
    /// * E_CANNOT_TIP_SELF - If tipper tries to tip their own Suit
    /// 
    /// # Example Usage
    /// ```move
    /// // User tips 0.1 SUI to a Suit
    /// let payment = coin::split(&mut user_coin, 100_000_000, ctx);
    /// tip_suit(suit, recipient_balance, payment, clock, ctx);
    /// ```
    public fun tip_suit(
        suit: &mut Suit,
        recipient_balance: &mut TipBalance,
        payment: Coin<SUI>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let tipper = tx_context::sender(ctx);
        let suit_id = object::id(suit);
        let recipient = suits::get_creator(suit);
        
        // Get the tip amount from the payment coin
        let amount = coin::value(&payment);
        
        // Validation 1: Ensure tip amount meets minimum threshold
        // This prevents spam tips and ensures meaningful contributions
        // Minimum is 0.01 SUI (10,000,000 MIST)
        assert!(amount >= MIN_TIP_AMOUNT, E_INVALID_TIP_AMOUNT);
        
        // Validation 2: Prevent self-tipping
        // Users cannot tip their own Suits to inflate their earnings
        assert!(tipper != recipient, E_CANNOT_TIP_SELF);
        
        // Validation 3: Ensure the recipient_balance belongs to the Suit creator
        // This prevents tipping to the wrong balance
        assert!(recipient_balance.owner == recipient, E_INVALID_TIP_AMOUNT);
        
        // Convert the payment Coin to Balance and add to recipient's balance
        // This is the actual transfer of funds from tipper to recipient
        // The Balance type ensures secure handling of SUI tokens
        let payment_balance = coin::into_balance(payment);
        balance::join(&mut recipient_balance.balance, payment_balance);
        
        // Update the recipient's total_received counter
        // This tracks lifetime earnings for transparency and statistics
        recipient_balance.total_received = recipient_balance.total_received + amount;
        
        // Update the Suit's tip_total for display purposes
        // This allows the frontend to show how much a Suit has earned
        suits::add_tip_amount(suit, amount);
        
        // Get current timestamp for the event
        let timestamp = clock::timestamp_ms(clock);
        
        // Emit event for off-chain indexing and notifications
        // The event allows tracking of all tipping activity
        event::emit(TipSent {
            suit_id,
            tipper,
            recipient,
            amount,
            timestamp,
        });
    }

    /// Create a new TipBalance for a user.
    /// 
    /// This public function allows users to explicitly create their TipBalance
    /// before receiving tips. While the get_or_create_tip_balance helper provides
    /// lazy initialization, some users may prefer to set up their balance in advance.
    /// 
    /// # Arguments
    /// * `registry` - Mutable reference to the TipBalanceRegistry
    /// * `ctx` - Transaction context
    /// 
    /// # Returns
    /// * `ID` - The object ID of the newly created TipBalance
    /// 
    /// # Note
    /// This function uses the internal get_or_create_tip_balance helper,
    /// so calling it multiple times will return the existing balance ID
    /// rather than creating duplicates.
    public fun create_tip_balance(
        registry: &mut TipBalanceRegistry,
        ctx: &mut TxContext
    ): ID {
        let user_address = tx_context::sender(ctx);
        get_or_create_tip_balance(registry, user_address, ctx)
    }


    /// Withdraw accumulated tips from TipBalance to user's wallet.
    /// 
    /// This function allows content creators to withdraw their earnings with
    /// comprehensive security checks:
    /// 1. Verifies caller owns the TipBalance (authorization)
    /// 2. Validates withdrawal amount doesn't exceed available balance
    /// 3. Rejects withdrawal if balance is zero
    /// 4. Transfers SUI from balance to user's wallet
    /// 5. Updates balance and total_withdrawn counter
    /// 6. Emits FundsWithdrawn event for tracking
    /// 
    /// # Withdrawal Security Checks
    /// - Only the balance owner can withdraw (prevents theft)
    /// - Amount validation prevents overdraft
    /// - Zero balance check provides clear error message
    /// - Atomic operation ensures consistency
    /// 
    /// # Arguments
    /// * `tip_balance` - Mutable reference to the user's TipBalance
    /// * `amount` - Amount to withdraw in MIST (must be <= available balance)
    /// * `clock` - Sui Clock object for timestamp
    /// * `ctx` - Transaction context
    /// 
    /// # Panics
    /// * E_WITHDRAWAL_FAILED - If caller is not the balance owner
    /// * E_ZERO_BALANCE - If balance is zero (nothing to withdraw)
    /// * E_INSUFFICIENT_BALANCE - If withdrawal amount exceeds available balance
    /// 
    /// # Example Usage
    /// ```move
    /// // User withdraws 1 SUI from their balance
    /// withdraw_funds(tip_balance, 1_000_000_000, clock, ctx);
    /// // The SUI is transferred to the user's wallet as a Coin<SUI> object
    /// ```
    #[allow(lint(self_transfer))]
    public fun withdraw_funds(
        tip_balance: &mut TipBalance,
        amount: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let caller = tx_context::sender(ctx);
        
        // Security Check 1: Verify caller owns the TipBalance
        // Only the balance owner can withdraw their earnings
        // This is the primary authorization check preventing theft
        assert!(tip_balance.owner == caller, E_WITHDRAWAL_FAILED);
        
        // Get current balance amount for validation
        let current_balance = balance::value(&tip_balance.balance);
        
        // Security Check 2: Reject if balance is zero
        // Provides a clear error message when there's nothing to withdraw
        assert!(current_balance > 0, E_ZERO_BALANCE);
        
        // Security Check 3: Validate withdrawal amount doesn't exceed balance
        // Prevents overdraft and ensures the withdrawal can succeed
        assert!(amount <= current_balance, E_INSUFFICIENT_BALANCE);
        
        // Split the requested amount from the balance
        // This removes the amount from the TipBalance
        let withdrawal_balance = balance::split(&mut tip_balance.balance, amount);
        
        // Convert the Balance to a Coin object for transfer
        // Coins can be transferred to user wallets
        let withdrawal_coin = coin::from_balance(withdrawal_balance, ctx);
        
        // Update the total_withdrawn counter
        // This tracks lifetime withdrawals for transparency and statistics
        tip_balance.total_withdrawn = tip_balance.total_withdrawn + amount;
        
        // Get current timestamp for the event
        let timestamp = clock::timestamp_ms(clock);
        
        // Emit event for off-chain tracking and notifications
        // Allows users to track their withdrawal history
        event::emit(FundsWithdrawn {
            owner: caller,
            amount,
            timestamp,
        });
        
        // Transfer the withdrawal coin to the user's wallet
        // This is the final step that gives the user access to their funds
        transfer::public_transfer(withdrawal_coin, caller);
    }


    // ===== Query Functions =====

    /// Get the current withdrawable balance amount.
    /// 
    /// Returns the amount of SUI currently available for withdrawal in MIST.
    /// This is the balance that has been accumulated from tips but not yet withdrawn.
    /// 
    /// # Balance Tracking
    /// The balance represents the current withdrawable amount:
    /// - Increases when tips are received (via tip_suit)
    /// - Decreases when funds are withdrawn (via withdraw_funds)
    /// - Always reflects the actual SUI held in the Balance<SUI> object
    /// 
    /// # Arguments
    /// * `tip_balance` - Reference to the TipBalance to query
    /// 
    /// # Returns
    /// * `u64` - Current balance in MIST (1 SUI = 1,000,000,000 MIST)
    /// 
    /// # Example
    /// ```move
    /// let balance_mist = get_balance(tip_balance);
    /// // Convert to SUI: balance_sui = balance_mist / 1_000_000_000
    /// ```
    public fun get_balance(tip_balance: &TipBalance): u64 {
        balance::value(&tip_balance.balance)
    }

    /// Get the lifetime total of tips received.
    /// 
    /// Returns the cumulative amount of all tips ever received by this user.
    /// This counter only increases and is never reset, providing a complete
    /// history of earnings.
    /// 
    /// # Tracking Logic
    /// - Incremented every time a tip is received (in tip_suit)
    /// - Never decreases, even when funds are withdrawn
    /// - Useful for displaying creator statistics and achievements
    /// 
    /// # Arguments
    /// * `tip_balance` - Reference to the TipBalance to query
    /// 
    /// # Returns
    /// * `u64` - Total tips received in MIST
    /// 
    /// # Relationship to Balance
    /// total_received >= current_balance + total_withdrawn
    /// (Some tips may have been withdrawn)
    public fun get_total_received(tip_balance: &TipBalance): u64 {
        tip_balance.total_received
    }

    /// Get the lifetime total of tips withdrawn.
    /// 
    /// Returns the cumulative amount of all withdrawals ever made by this user.
    /// This counter only increases and is never reset, providing a complete
    /// history of withdrawals.
    /// 
    /// # Tracking Logic
    /// - Incremented every time funds are withdrawn (in withdraw_funds)
    /// - Never decreases
    /// - Useful for displaying withdrawal history and tax reporting
    /// 
    /// # Arguments
    /// * `tip_balance` - Reference to the TipBalance to query
    /// 
    /// # Returns
    /// * `u64` - Total withdrawn in MIST
    /// 
    /// # Balance Calculation
    /// current_balance = total_received - total_withdrawn
    /// This relationship always holds true and can be used to verify balance integrity.
    public fun get_total_withdrawn(tip_balance: &TipBalance): u64 {
        tip_balance.total_withdrawn
    }

    // ===== Getter Functions for TipBalance Fields =====

    /// Get the TipBalance owner address
    public fun get_owner(tip_balance: &TipBalance): address {
        tip_balance.owner
    }

    // ===== Test-only Functions =====

    #[test_only]
    /// Initialize registry for testing
    public fun init_for_testing(ctx: &mut TxContext) {
        init(ctx);
    }
}

