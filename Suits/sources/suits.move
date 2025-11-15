
module suits::suits {
    use std::string::{String, utf8};
    use sui::table::{Self, Table};
    use sui::event;
    use sui::clock::{Self, Clock};

    // ===== Error Constants =====
    
    const E_EMPTY_CONTENT: u64 = 10;
    const E_CONTENT_TOO_LONG: u64 = 11;

    // ===== Structs =====

    public struct Suit has key, store {
        id: UID,
        creator: address,
        content: String,
        media_urls: vector<String>,
        created_at: u64,
        like_count: u64,
        comment_count: u64,
        retweet_count: u64,
        tip_total: u64,
    }


    public struct SuitRegistry has key {
        id: UID,
        suits: Table<ID, address>,
        suit_ids: vector<ID>,
    }

    // ===== Events =====

    public struct SuitCreated has copy, drop {
        suit_id: ID,
        creator: address,
        content_preview: String,
        timestamp: u64,
    }

    // ===== Initialization =====


    fun init(ctx: &mut TxContext) {
        let registry = SuitRegistry {
            id: object::new(ctx),
            suits: table::new(ctx),
            suit_ids: vector::empty(),
        };
        transfer::share_object(registry);
    }

    // ===== Public Functions =====

  
    public fun create_suit(
        registry: &mut SuitRegistry,
        content: vector<u8>,
        media_urls: vector<vector<u8>>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender_addr = tx_context::sender(ctx);
        let content_string = utf8(content);
        
        let content_length = std::string::length(&content_string);
        assert!(content_length > 0, E_EMPTY_CONTENT);
        
        assert!(content_length <= 280, E_CONTENT_TOO_LONG);
        
        let mut media_urls_strings = vector::empty<String>();
        let mut i = 0;
        let media_len = vector::length(&media_urls);
        while (i < media_len) {
            let url = vector::borrow(&media_urls, i);
            vector::push_back(&mut media_urls_strings, utf8(*url));
            i = i + 1;
        };
        
        let timestamp = clock::timestamp_ms(clock);
        
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
        
        table::add(&mut registry.suits, suit_id, sender_addr);
        vector::push_back(&mut registry.suit_ids, suit_id);
        
        let preview = if (content_length > 100) {
            std::string::substring(&content_string, 0, 100)
        } else {
            content_string
        };
        
        event::emit(SuitCreated {
            suit_id,
            creator: sender_addr,
            content_preview: preview,
            timestamp,
        });
        
        transfer::share_object(suit);
    }

    // ===== Counter Update Functions =====

    public fun increment_like_count(suit: &mut Suit) {
        suit.like_count = suit.like_count + 1;
    }

    public fun decrement_like_count(suit: &mut Suit) {
        if (suit.like_count > 0) {
            suit.like_count = suit.like_count - 1;
        };
    }


    public fun increment_comment_count(suit: &mut Suit) {
        suit.comment_count = suit.comment_count + 1;
    }


    public fun increment_retweet_count(suit: &mut Suit) {
        suit.retweet_count = suit.retweet_count + 1;
    }


    public fun decrement_retweet_count(suit: &mut Suit) {
        // Ensure count doesn't underflow below 0
        if (suit.retweet_count > 0) {
            suit.retweet_count = suit.retweet_count - 1;
        };
    }

    // ===== Tipping Integration =====

    public fun add_tip_amount(suit: &mut Suit, amount: u64) {
        suit.tip_total = suit.tip_total + amount;
    }

    // ===== Query Functions =====

    public fun get_recent_suits(
        registry: &SuitRegistry,
        limit: u64,
        offset: u64
    ): vector<ID> {
        let mut result = vector::empty<ID>();
        let total_suits = vector::length(&registry.suit_ids);
        
        if (offset >= total_suits) {
            return result
        };
        
        let mut start_idx = total_suits - offset - 1;
        let mut count = 0;
        
        while (count < limit && start_idx >= 0) {
            let suit_id = *vector::borrow(&registry.suit_ids, start_idx);
            vector::push_back(&mut result, suit_id);
            
            count = count + 1;
            
            if (start_idx == 0) {
                break
            };
            start_idx = start_idx - 1;
        };
        
        result
    }


    public fun get_suits_by_creator(
        registry: &SuitRegistry,
        creator_address: address
    ): vector<ID> {
        let mut result = vector::empty<ID>();
        let mut i = 0;
        let total_suits = vector::length(&registry.suit_ids);
        
        while (i < total_suits) {
            let suit_id = *vector::borrow(&registry.suit_ids, i);
            let creator = table::borrow(&registry.suits, suit_id);
            
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