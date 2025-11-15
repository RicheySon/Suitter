
module suits::interactions {
    use sui::table::{Self, Table};
    use sui::event;
    use sui::clock::{Self, Clock};
    use sui::bcs;
    use std::string::{String, utf8};
    use suits::suits::{Self, Suit};

    // ===== Error Constants =====
    
    const E_ALREADY_LIKED: u64 = 20;
    const E_NOT_LIKED: u64 = 21;
    const E_ALREADY_RETWEETED: u64 = 22;
    const E_NOT_RETWEETED: u64 = 23;
    const E_CANNOT_LIKE_OWN_SUIT: u64 = 24;
    const E_EMPTY_COMMENT: u64 = 25;

    // ===== Structs =====

    public struct Like has key, store {
        id: UID,
        suit_id: ID,
        liker: address,
        created_at: u64,
    }

    public struct Comment has key, store {
        id: UID,
        suit_id: ID,
        commenter: address,
        content: String,
        created_at: u64,
    }

    public struct Retweet has key, store {
        id: UID,
        original_suit_id: ID,
        retweeter: address,
        created_at: u64,
    }

    public struct InteractionRegistry has key {
        id: UID,
        likes: Table<vector<u8>, bool>,
        retweets: Table<vector<u8>, bool>,
    }

    // ===== Events =====

    public struct LikeCreated has copy, drop {
        like_id: ID,
        suit_id: ID,
        liker: address,
        timestamp: u64,
    }

    public struct CommentCreated has copy, drop {
        comment_id: ID,
        suit_id: ID,
        commenter: address,
        timestamp: u64,
    }

    public struct RetweetCreated has copy, drop {
        retweet_id: ID,
        original_suit_id: ID,
        retweeter: address,
        timestamp: u64,
    }

    // ===== Initialization =====

    fun init(ctx: &mut TxContext) {
        let registry = InteractionRegistry {
            id: object::new(ctx),
            likes: table::new(ctx),
            retweets: table::new(ctx),
        };
        transfer::share_object(registry);
    }

    // ===== Helper Functions =====

    fun create_interaction_key(suit_id: ID, user_address: address): vector<u8> {
        let mut key = bcs::to_bytes(&suit_id);
        vector::append(&mut key, bcs::to_bytes(&user_address));
        key
    }

    // ===== Public Functions =====

    #[allow(lint(self_transfer))]
    public fun like_suit(
        suit: &mut Suit,
        registry: &mut InteractionRegistry,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let liker = tx_context::sender(ctx);
        let suit_id = object::id(suit);
        
        assert!(liker != suits::get_creator(suit), E_CANNOT_LIKE_OWN_SUIT);
        
        let key = create_interaction_key(suit_id, liker);
        assert!(!table::contains(&registry.likes, key), E_ALREADY_LIKED);
        
        let timestamp = clock::timestamp_ms(clock);
        
        let like = Like {
            id: object::new(ctx),
            suit_id,
            liker,
            created_at: timestamp,
        };
        
        let like_id = object::id(&like);
        
        table::add(&mut registry.likes, key, true);
        
        suits::increment_like_count(suit);
        
        event::emit(LikeCreated {
            like_id,
            suit_id,
            liker,
            timestamp,
        });
        
        transfer::transfer(like, liker);
    }

    public fun unlike_suit(
        suit: &mut Suit,
        like: Like,
        registry: &mut InteractionRegistry,
        ctx: &mut TxContext
    ) {
        let liker = tx_context::sender(ctx);
        let suit_id = object::id(suit);
        
        assert!(like.suit_id == suit_id, E_NOT_LIKED);
        
        let key = create_interaction_key(suit_id, liker);
        
        table::remove(&mut registry.likes, key);
        
        suits::decrement_like_count(suit);
        
        let Like { id, suit_id: _, liker: _, created_at: _ } = like;
        object::delete(id);
    }

    #[allow(lint(self_transfer))]
    public fun comment_on_suit(
        suit: &mut Suit,
        content: vector<u8>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let commenter = tx_context::sender(ctx);
        let suit_id = object::id(suit);
        let content_string = utf8(content);
        
        assert!(std::string::length(&content_string) > 0, E_EMPTY_COMMENT);
        
        let timestamp = clock::timestamp_ms(clock);
        
        let comment = Comment {
            id: object::new(ctx),
            suit_id,
            commenter,
            content: content_string,
            created_at: timestamp,
        };
        
        let comment_id = object::id(&comment);
        
        suits::increment_comment_count(suit);
        
        event::emit(CommentCreated {
            comment_id,
            suit_id,
            commenter,
            timestamp,
        });
        
        transfer::transfer(comment, commenter);
    }


    #[allow(lint(self_transfer))]
    public fun retweet_suit(
        suit: &mut Suit,
        registry: &mut InteractionRegistry,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let retweeter = tx_context::sender(ctx);
        let suit_id = object::id(suit);
        
        assert!(retweeter != suits::get_creator(suit), E_CANNOT_LIKE_OWN_SUIT);
        
        let key = create_interaction_key(suit_id, retweeter);
        assert!(!table::contains(&registry.retweets, key), E_ALREADY_RETWEETED);
        
        let timestamp = clock::timestamp_ms(clock);
        
        let retweet = Retweet {
            id: object::new(ctx),
            original_suit_id: suit_id,
            retweeter,
            created_at: timestamp,
        };
        
        let retweet_id = object::id(&retweet);
        
        table::add(&mut registry.retweets, key, true);
        
        suits::increment_retweet_count(suit);
        
        event::emit(RetweetCreated {
            retweet_id,
            original_suit_id: suit_id,
            retweeter,
            timestamp,
        });
        
        transfer::transfer(retweet, retweeter);
    }

    public fun unretweet_suit(
        suit: &mut Suit,
        retweet: Retweet,
        registry: &mut InteractionRegistry,
        ctx: &mut TxContext
    ) {
        let retweeter = tx_context::sender(ctx);
        let suit_id = object::id(suit);
        
        assert!(retweet.original_suit_id == suit_id, E_NOT_RETWEETED);
        
        let key = create_interaction_key(suit_id, retweeter);
        
        table::remove(&mut registry.retweets, key);
        
        suits::decrement_retweet_count(suit);
        
        let Retweet { id, original_suit_id: _, retweeter: _, created_at: _ } = retweet;
        object::delete(id);
    }

    // ===== Query Functions =====

    public fun has_user_liked(
        registry: &InteractionRegistry,
        suit_id: ID,
        user_address: address
    ): bool {
        let key = create_interaction_key(suit_id, user_address);
        table::contains(&registry.likes, key)
    }

    public fun has_user_retweeted(
        registry: &InteractionRegistry,
        suit_id: ID,
        user_address: address
    ): bool {
        let key = create_interaction_key(suit_id, user_address);
        table::contains(&registry.retweets, key)
    }

    // ===== Getter Functions for Comment Fields =====

    /// Get the Suit ID that a comment belongs to
    public fun get_comment_suit_id(comment: &Comment): ID {
        comment.suit_id
    }

    /// Get the commenter address
    public fun get_comment_commenter(comment: &Comment): address {
        comment.commenter
    }

    /// Get the comment content
    public fun get_comment_content(comment: &Comment): String {
        comment.content
    }

    /// Get the comment creation timestamp
    public fun get_comment_created_at(comment: &Comment): u64 {
        comment.created_at
    }

    /// Get the Suit ID that a like belongs to
    public fun get_like_suit_id(like: &Like): ID {
        like.suit_id
    }

    /// Get the liker address
    public fun get_like_liker(like: &Like): address {
        like.liker
    }

    /// Get the like creation timestamp
    public fun get_like_created_at(like: &Like): u64 {
        like.created_at
    }

    /// Get the original Suit ID that a retweet belongs to
    public fun get_retweet_suit_id(retweet: &Retweet): ID {
        retweet.original_suit_id
    }

    /// Get the retweeter address
    public fun get_retweet_retweeter(retweet: &Retweet): address {
        retweet.retweeter
    }

    /// Get the retweet creation timestamp
    public fun get_retweet_created_at(retweet: &Retweet): u64 {
        retweet.created_at
    }

    // ===== Test-only Functions =====

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(ctx);
    }
}
