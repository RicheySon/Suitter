/// Suits module for managing posts (Suits) on Suitter
/// Handles post creation, management, and feed queries
module suits::suits {
    use std::string::{String, utf8};
    use sui::table::{Self, Table};
    use sui::event;
    use sui::clock::{Self, Clock};

    // ===== Error Constants =====
    
    /// Content is empty or missing
    const E_EMPTY_CONTENT: u64 = 10;
    /// Content exceeds maximum allowed length
    const E_CONTENT_TOO_LONG: u64 = 11;

    // ===== Structs =====

    /// Represents a post (Suit) on Suitter
    /// Contains content, media, and interaction counters
    public struct Suit has key, store {
        /// Unique identifier for this Suit
        id: UID,
        /// Wallet address of the user who created this Suit
        creator: address,
        /// Text content of the post (required, max 280 characters)
        content: String,
        /// Optional vector of media URLs (images or videos)
        media_urls: vector<String>,
        /// Unix timestamp when the Suit was created
        created_at: u64,
        /// Number of likes this Suit has received
        like_count: u64,
        /// Number of comments on this Suit
        comment_count: u64,
        /// Number of times this Suit has been retweeted
        retweet_count: u64,
        /// Total amount of SUI tips received for this Suit
        tip_total: u64,
    }

    /// Global registry for all Suits to enable feed queries
    /// Tracks all Suit IDs and their creators for efficient feed generation
    /// This shared object allows anyone to query the list of all Suits
    public struct SuitRegistry has key {
        /// Unique identifier for the registry
        id: UID,
        /// Maps Suit ID to creator address for quick lookups
        suits: Table<ID, address>,
        /// Ordered vector of all Suit IDs for chronological feed display
        suit_ids: vector<ID>,
    }

    // ===== Events =====

    /// Event emitted when a Suit is created
    public struct SuitCreated has copy, drop {
        suit_id: ID,
        creator: address,
        content_preview: String,
        timestamp: u64,
    }

    // ===== Initialization =====

    /// Initialize the SuitRegistry as a shared object
    /// This function is called once during module deployment
    fun init(ctx: &mut TxContext) {
        let registry = SuitRegistry {
            id: object::new(ctx),
            suits: table::new(ctx),
            suit_ids: vector::empty(),
        };
        transfer::share_object(registry);
    }

    // ===== Public Functions =====

    /// Create a new Suit (post) with content validation and registry tracking.
    /// 
    /// This function performs the following steps:
    /// 1. Validates that content is not empty
    /// 2. Validates that content does not exceed maximum length (280 characters)
    /// 3. Creates the Suit object as a shared object
    /// 4. Registers the Suit in the SuitRegistry for feed queries
    /// 5. Emits a SuitCreated event with content preview
    /// 
    /// # Arguments
    /// * `registry` - Shared SuitRegistry to track all Suits
    /// * `content` - Text content of the Suit as bytes (required)
    /// * `media_urls` - Optional vector of media URLs as bytes
    /// * `clock` - Sui Clock object for timestamp
    /// * `ctx` - Transaction context
    /// 
    /// # Panics
    /// * E_EMPTY_CONTENT - If content is empty or missing
    /// * E_CONTENT_TOO_LONG - If content exceeds 280 characters
    public fun create_suit(
        registry: &mut SuitRegistry,
        content: vector<u8>,
        media_urls: vector<vector<u8>>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender_addr = tx_context::sender(ctx);
        let content_string = utf8(content);
        
        // Validation step 1: Ensure content is not empty
        // Every Suit must have text content
        let content_length = std::string::length(&content_string);
        assert!(content_length > 0, E_EMPTY_CONTENT);
        
        // Validation step 2: Ensure content does not exceed maximum length
        // Limit to 280 characters (similar to Twitter)
        assert!(content_length <= 280, E_CONTENT_TOO_LONG);
        
        // Convert media URLs from bytes to String vector
        let mut media_urls_strings = vector::empty<String>();
        let mut i = 0;
        let media_len = vector::length(&media_urls);
        while (i < media_len) {
            let url = vector::borrow(&media_urls, i);
            vector::push_back(&mut media_urls_strings, utf8(*url));
            i = i + 1;
        };
        
        // Get current timestamp from the Clock object
        let timestamp = clock::timestamp_ms(clock);
        
        // Create the Suit object with all fields initialized
        // Counters start at 0 and will be incremented by interaction functions
        let suit = Suit {
            id: object::new(ctx),
            creator: sender_addr,
            content: content_string,
            media_urls: media_urls_strings,
            created_at: timestamp,
            like_count: 0,
            comment_count: 0,
            retweet_count: 0,
            tip_total: 0,
        };
        
        let suit_id = object::id(&suit);
        
        // Register the Suit in the registry for feed queries
        // This allows the frontend to retrieve all Suits chronologically
        table::add(&mut registry.suits, suit_id, sender_addr);
        vector::push_back(&mut registry.suit_ids, suit_id);
        
        // Create content preview (first 100 characters) for the event
        let preview = if (content_length > 100) {
            std::string::substring(&content_string, 0, 100)
        } else {
            content_string
        };
        
        // Emit event for off-chain indexing and real-time updates
        event::emit(SuitCreated {
            suit_id,
            creator: sender_addr,
            content_preview: preview,
            timestamp,
        });
        
        // Share the Suit object so anyone can read and interact with it
        transfer::share_object(suit);
    }

    // ===== Counter Update Functions =====

    /// Increment the like count on a Suit.
    /// 
    /// This function is called by the interactions module when a user likes a Suit.
    /// It atomically increments the like counter to maintain accurate counts.
    /// 
    /// # Arguments
    /// * `suit` - Mutable reference to the Suit being liked
    /// 
    /// # Authorization
    /// This function should only be called by the interactions module
    public fun increment_like_count(suit: &mut Suit) {
        suit.like_count = suit.like_count + 1;
    }

    /// Decrement the like count on a Suit.
    /// 
    /// This function is called by the interactions module when a user unlikes a Suit.
    /// It atomically decrements the like counter.
    /// 
    /// # Arguments
    /// * `suit` - Mutable reference to the Suit being unliked
    /// 
    /// # Authorization
    /// This function should only be called by the interactions module
    public fun decrement_like_count(suit: &mut Suit) {
        // Ensure count doesn't underflow below 0
        if (suit.like_count > 0) {
            suit.like_count = suit.like_count - 1;
        };
    }

    /// Increment the comment count on a Suit.
    /// 
    /// This function is called by the interactions module when a user comments on a Suit.
    /// It atomically increments the comment counter.
    /// 
    /// # Arguments
    /// * `suit` - Mutable reference to the Suit being commented on
    /// 
    /// # Authorization
    /// This function should only be called by the interactions module
    public fun increment_comment_count(suit: &mut Suit) {
        suit.comment_count = suit.comment_count + 1;
    }

    /// Increment the retweet count on a Suit.
    /// 
    /// This function is called by the interactions module when a user retweets a Suit.
    /// It atomically increments the retweet counter.
    /// 
    /// # Arguments
    /// * `suit` - Mutable reference to the Suit being retweeted
    /// 
    /// # Authorization
    /// This function should only be called by the interactions module
    public fun increment_retweet_count(suit: &mut Suit) {
        suit.retweet_count = suit.retweet_count + 1;
    }

    /// Decrement the retweet count on a Suit.
    /// 
    /// This function is called by the interactions module when a user unretweets a Suit.
    /// It atomically decrements the retweet counter.
    /// 
    /// # Arguments
    /// * `suit` - Mutable reference to the Suit being unretweeted
    /// 
    /// # Authorization
    /// This function should only be called by the interactions module
    public fun decrement_retweet_count(suit: &mut Suit) {
        // Ensure count doesn't underflow below 0
        if (suit.retweet_count > 0) {
            suit.retweet_count = suit.retweet_count - 1;
        };
    }

    // ===== Tipping Integration =====

    /// Add a tip amount to the Suit's total tips received.
    /// 
    /// This function is called by the tipping module when a user tips a Suit creator.
    /// It tracks the total amount of SUI tips this Suit has received.
    /// The actual SUI transfer is handled by the tipping module.
    /// 
    /// # Arguments
    /// * `suit` - Mutable reference to the Suit being tipped
    /// * `amount` - Amount of SUI being tipped (in MIST)
    /// 
    /// # Authorization
    /// This function should only be called by the tipping module
    /// The tipping module is responsible for validating the tip and transferring funds
    public fun add_tip_amount(suit: &mut Suit, amount: u64) {
        suit.tip_total = suit.tip_total + amount;
    }

    // ===== Query Functions =====

    /// Retrieve recent Suits with pagination support.
    /// 
    /// Returns a vector of Suit IDs in reverse chronological order (newest first).
    /// Pagination allows efficient loading of large feeds.
    /// 
    /// # Arguments
    /// * `registry` - Reference to the SuitRegistry
    /// * `limit` - Maximum number of Suits to return
    /// * `offset` - Number of Suits to skip (for pagination)
    /// 
    /// # Returns
    /// * `vector<ID>` - Vector of Suit IDs
    /// 
    /// # Pagination Logic
    /// - offset=0, limit=20: Returns the 20 most recent Suits
    /// - offset=20, limit=20: Returns Suits 21-40 (next page)
    /// - If offset exceeds total Suits, returns empty vector
    public fun get_recent_suits(
        registry: &SuitRegistry,
        limit: u64,
        offset: u64
    ): vector<ID> {
        let mut result = vector::empty<ID>();
        let total_suits = vector::length(&registry.suit_ids);
        
        // Return empty if offset is beyond available Suits
        if (offset >= total_suits) {
            return result
        };
        
        // Calculate the starting index (from the end, since we want newest first)
        // suit_ids is in chronological order, so we reverse iterate
        let mut start_idx = total_suits - offset - 1;
        let mut count = 0;
        
        // Iterate backwards to get newest Suits first
        while (count < limit && start_idx >= 0) {
            let suit_id = *vector::borrow(&registry.suit_ids, start_idx);
            vector::push_back(&mut result, suit_id);
            
            count = count + 1;
            
            // Check for underflow before decrementing
            if (start_idx == 0) {
                break
            };
            start_idx = start_idx - 1;
        };
        
        result
    }

    /// Retrieve all Suits created by a specific user.
    /// 
    /// Returns a vector of Suit IDs for all Suits created by the given address.
    /// Useful for displaying a user's profile page with their posts.
    /// 
    /// # Arguments
    /// * `registry` - Reference to the SuitRegistry
    /// * `creator_address` - Address of the creator to filter by
    /// 
    /// # Returns
    /// * `vector<ID>` - Vector of Suit IDs created by the user
    public fun get_suits_by_creator(
        registry: &SuitRegistry,
        creator_address: address
    ): vector<ID> {
        let mut result = vector::empty<ID>();
        let mut i = 0;
        let total_suits = vector::length(&registry.suit_ids);
        
        // Iterate through all Suits and filter by creator
        while (i < total_suits) {
            let suit_id = *vector::borrow(&registry.suit_ids, i);
            let creator = table::borrow(&registry.suits, suit_id);
            
            // Add to result if creator matches
            if (*creator == creator_address) {
                vector::push_back(&mut result, suit_id);
            };
            
            i = i + 1;
        };
        
        result
    }

    // ===== Getter Functions for Suit Fields =====

    /// Get the Suit creator address
    public fun get_creator(suit: &Suit): address {
        suit.creator
    }

    /// Get the Suit content
    public fun get_content(suit: &Suit): String {
        suit.content
    }

    /// Get the Suit media URLs
    public fun get_media_urls(suit: &Suit): vector<String> {
        suit.media_urls
    }

    /// Get the Suit creation timestamp
    public fun get_created_at(suit: &Suit): u64 {
        suit.created_at
    }

    /// Get the Suit like count
    public fun get_like_count(suit: &Suit): u64 {
        suit.like_count
    }

    /// Get the Suit comment count
    public fun get_comment_count(suit: &Suit): u64 {
        suit.comment_count
    }

    /// Get the Suit retweet count
    public fun get_retweet_count(suit: &Suit): u64 {
        suit.retweet_count
    }

    /// Get the Suit tip total
    public fun get_tip_total(suit: &Suit): u64 {
        suit.tip_total
    }

    // ===== Test-only Functions =====

    #[test_only]
    /// Initialize registry for testing
    public fun init_for_testing(ctx: &mut TxContext) {
        init(ctx);
    }
} 