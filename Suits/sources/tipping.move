module suits::tipping {
    use sui::table::{Self, Table};
    use sui::event;
    use sui::clock::{Self, Clock};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::balance::{Self, Balance};
    use suits::suits::{Self, Suit};

    // ===== Error Constants =====
    
    const E_INSUFFICIENT_BALANCE: u64 = 30;
    const E_INVALID_TIP_AMOUNT: u64 = 31;
    const E_CANNOT_TIP_SELF: u64 = 32;
    const E_WITHDRAWAL_FAILED: u64 = 33;
    const E_ZERO_BALANCE: u64 = 34;

    // ===== Constants =====
    
    /// Minimum tip amount in MIST (0.01 SUI = 10,000,000 MIST)
    const MIN_TIP_AMOUNT: u64 = 10_000_000;

    // ===== Structs =====

    public struct TipBalance has key {
        id: UID,
        owner: address,
        balance: Balance<SUI>,
        total_received: u64,
        total_withdrawn: u64,
    }

    public struct TipBalanceRegistry has key {
        id: UID,
        balances: Table<address, ID>,
    }

    // ===== Events =====

    public struct TipSent has copy, drop {
        suit_id: ID,
        tipper: address,
        recipient: address,
        amount: u64,
        timestamp: u64,
    }

    public struct FundsWithdrawn has copy, drop {
        owner: address,
        amount: u64,
        timestamp: u64,
    }

    // ===== Initialization =====

    fun init(ctx: &mut TxContext) {
        let registry = TipBalanceRegistry {
            id: object::new(ctx),
            balances: table::new(ctx),
        };
        transfer::share_object(registry);
    }


    // ===== Helper Functions =====

    fun get_or_create_tip_balance(
        registry: &mut TipBalanceRegistry,
        user_address: address,
        ctx: &mut TxContext
    ): ID {
        if (table::contains(&registry.balances, user_address)) {
            *table::borrow(&registry.balances, user_address)
        } else {
            let tip_balance = TipBalance {
                id: object::new(ctx),
                owner: user_address,
                balance: balance::zero<SUI>(),
                total_received: 0,
                total_withdrawn: 0,
            };
            
            let balance_id = object::id(&tip_balance);
            
            table::add(&mut registry.balances, user_address, balance_id);
            
            transfer::share_object(tip_balance);
            
            balance_id
        }
    }


    // ===== Public Functions =====

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
        
        let amount = coin::value(&payment);
        
        assert!(amount >= MIN_TIP_AMOUNT, E_INVALID_TIP_AMOUNT);
        
        assert!(tipper != recipient, E_CANNOT_TIP_SELF);
        
        assert!(recipient_balance.owner == recipient, E_INVALID_TIP_AMOUNT);
        
        let payment_balance = coin::into_balance(payment);
        balance::join(&mut recipient_balance.balance, payment_balance);
        
        recipient_balance.total_received = recipient_balance.total_received + amount;
        
        suits::add_tip_amount(suit, amount);
        
        let timestamp = clock::timestamp_ms(clock);
        
        event::emit(TipSent {
            suit_id,
            tipper,
            recipient,
            amount,
            timestamp,
        });
    }


    public fun create_tip_balance(
        registry: &mut TipBalanceRegistry,
        ctx: &mut TxContext
    ): ID {
        let user_address = tx_context::sender(ctx);
        get_or_create_tip_balance(registry, user_address, ctx)
    }


    #[allow(lint(self_transfer))]
    public fun withdraw_funds(
        tip_balance: &mut TipBalance,
        amount: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let caller = tx_context::sender(ctx);
        
        assert!(tip_balance.owner == caller, E_WITHDRAWAL_FAILED);
        
        let current_balance = balance::value(&tip_balance.balance);
        
        assert!(current_balance > 0, E_ZERO_BALANCE);
        
        assert!(amount <= current_balance, E_INSUFFICIENT_BALANCE);
        
        let withdrawal_balance = balance::split(&mut tip_balance.balance, amount);
        
        let withdrawal_coin = coin::from_balance(withdrawal_balance, ctx);
        
        tip_balance.total_withdrawn = tip_balance.total_withdrawn + amount;
        
        let timestamp = clock::timestamp_ms(clock);
        
        event::emit(FundsWithdrawn {
            owner: caller,
            amount,
            timestamp,
        });
        
        transfer::public_transfer(withdrawal_coin, caller);
    }


    // ===== Query Functions =====

    public fun get_balance(tip_balance: &TipBalance): u64 {
        balance::value(&tip_balance.balance)
    }


    public fun get_total_received(tip_balance: &TipBalance): u64 {
        tip_balance.total_received
    }


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

