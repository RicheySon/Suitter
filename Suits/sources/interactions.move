
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

    /// Registry to track user interactions and prevent duplicates
    /// Uses composite keys (suit_id + user_address) for likes and retweets
    public struct InteractionRegistry has key {
        id: UID,
        likes: Table<vector<u8>, bool>,
        retweets: Table<vector<u8>, bool>,
    }

    // ===== Events =====

    /// Event emitted when a Like is created
    public struct LikeCreated has copy, drop {
        like_id: ID,
        suit_id: ID,
        liker: address,
        timestamp: u64,
    }

    /// Event emitted when a Comment is created
    public struct CommentCreated has copy, drop {
        comment_id: ID,
        suit_id: ID,
        commenter: address,
        timestamp: u64,
    }

    /// Event emitted when a Retweet is created
    public struct RetweetCreated has copy, drop {
        retweet_id: ID,
        original_suit_id: ID,
        retweeter: address,
        timestamp: u64,
    }

    // ===== Initialization =====

    /// Initialize the InteractionRegistry as a shared object
    /// This function is called once during module deployment
    fun init(ctx: &mut TxContext) {
        let registry = InteractionRegistry {
            id: object::new(ctx),
            likes: table::new(ctx),
            retweets: table::new(ctx),
        };
        transfer::share_object(registry);
    }

    // ===== Helper Functions =====

    /// Create a composite key from suit_id and user address for duplicate prevention.
    /// 
    /// This helper function creates a unique key by concatenating the Suit ID and user address.
    /// The composite key is used in the InteractionRegistry to track which users have
    /// liked or retweeted specific Suits, preventing duplicate interactions.
    /// 
    /// # Arguments
    /// * `suit_id` - The ID of the Suit being interacted with
    /// * `user_address` - The address of the user performing the interaction
    /// 
    /// # Returns
    /// * `vector<u8>` - A unique composite key for the interaction
    /// 
    /// # Implementation
    /// Uses BCS (Binary Canonical Serialization) to encode both the suit_id and user_address,
    /// then concatenates them into a single byte vector for use as a table key.
    fun create_interaction_key(suit_id: ID, user_address: address): vector<u8> {
        let mut key = bcs::to_bytes(&suit_id);
        vector::append(&mut key, bcs::to_bytes(&user_address));
        key
    }

    // ===== Public Functions =====

    /// Like a Suit with duplicate checking and authorization.
    /// 
    /// This function performs the following steps:
    /// 1. Verifies the user hasn't already liked this Suit (prevents duplicates)
    /// 2. Prevents users from liking their own Suits
    /// 3. Creates a Like object owned by the user
    /// 4. Updates the InteractionRegistry to track the like
    /// 5. Increments the like count on the Suit
    /// 6. Emits a LikeCreated event for off-chain indexing
    /// 
    /// # Arguments
    /// * `suit` - Mutable reference to the Suit being liked
    /// * `registry` - Mutable reference to the InteractionRegistry
    /// * `clock` - Sui Clock object for timestamp
    /// * `ctx` - Transaction context
    /// 
    /// # Panics
    /// * E_ALREADY_LIKED - If the user has already liked this Suit
    /// * E_CANNOT_LIKE_OWN_SUIT - If the user tries to like their own Suit
    /// 
    /// # Authorization
    /// Only the transaction sender can create a Like object for themselves.
    /// The Like object is transferred to the sender, giving them ownership.
    #[allow(lint(self_transfer))]
    public fun like_suit(
        suit: &mut Suit,
        registry: &mut InteractionRegistry,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let liker = tx_context::sender(ctx);
        let suit_id = object::id(suit);
        
        // Authorization check: Prevent users from liking their own Suits
        // This maintains the integrity of the like system
        assert!(liker != suits::get_creator(suit), E_CANNOT_LIKE_OWN_SUIT);
        
        // Duplicate check: Verify user hasn't already liked this Suit
        // Uses composite key (suit_id + user_address) to track interactions
        let key = create_interaction_key(suit_id, liker);
        assert!(!table::contains(&registry.likes, key), E_ALREADY_LIKED);
        
        // Get current timestamp for the Like object
        let timestamp = clock::timestamp_ms(clock);
        
        // Create the Like object with all required fields
        // This object is owned by the user, giving them true ownership of their interaction
        let like = Like {
            id: object::new(ctx),
            suit_id,
            liker,
            created_at: timestamp,
        };
        
        let like_id = object::id(&like);
        
        // Update the registry to track this like and prevent duplicates
        // The registry is a shared object that maintains the global state
        table::add(&mut registry.likes, key, true);
        
        // Atomically increment the like count on the Suit
        // This ensures the counter stays in sync with actual Like objects
        suits::increment_like_count(suit);
        
        // Emit event for off-chain indexing and real-time UI updates
        event::emit(LikeCreated {
            like_id,
            suit_id,
            liker,
            timestamp,
        });
        
        // Transfer ownership of the Like object to the user
        // The user can later use this object to unlike the Suit
        transfer::transfer(like, liker);
    }

    /// Unlike a Suit by deleting the Like object.
    /// 
    /// This function performs the following steps:
    /// 1. Verifies the caller owns the Like object (authorization)
    /// 2. Removes the like entry from the InteractionRegistry
    /// 3. Decrements the like count on the Suit
    /// 4. Deletes the Like object to reclaim storage
    /// 
    /// # Arguments
    /// * `suit` - Mutable reference to the Suit being unliked
    /// * `like` - The Like object to be deleted (must be owned by caller)
    /// * `registry` - Mutable reference to the InteractionRegistry
    /// * `ctx` - Transaction context
    /// 
    /// # Panics
    /// * E_NOT_LIKED - If the Like object doesn't match the Suit
    /// 
    /// # Authorization
    /// The caller must own the Like object. Sui's object ownership model
    /// automatically enforces this - only the owner can pass the object as an argument.
    /// 
    /// # Cleanup Process
    /// Deleting the Like object reclaims storage and removes the interaction.
    /// The registry entry is removed to allow the user to like the Suit again in the future.
    public fun unlike_suit(
        suit: &mut Suit,
        like: Like,
        registry: &mut InteractionRegistry,
        ctx: &mut TxContext
    ) {
        let liker = tx_context::sender(ctx);
        let suit_id = object::id(suit);
        
        // Verify the Like object corresponds to this Suit
        // This prevents users from using a Like for one Suit to unlike another
        assert!(like.suit_id == suit_id, E_NOT_LIKED);
        
        // Create the composite key to remove from registry
        let key = create_interaction_key(suit_id, liker);
        
        // Remove the like entry from the registry
        // This allows the user to like the Suit again in the future
        table::remove(&mut registry.likes, key);
        
        // Atomically decrement the like count on the Suit
        // This keeps the counter in sync with actual Like objects
        suits::decrement_like_count(suit);
        
        // Delete the Like object to reclaim storage
        // Destructure the object to access its UID for deletion
        let Like { id, suit_id: _, liker: _, created_at: _ } = like;
        object::delete(id);
    }

    /// Comment on a Suit with content validation.
    /// 
    /// This function performs the following steps:
    /// 1. Validates that comment content is not empty
    /// 2. Creates a Comment object owned by the commenter
    /// 3. Increments the comment count on the Suit
    /// 4. Emits a CommentCreated event for off-chain indexing
    /// 
    /// # Arguments
    /// * `suit` - Mutable reference to the Suit being commented on
    /// * `content` - Comment text content as bytes
    /// * `clock` - Sui Clock object for timestamp
    /// * `ctx` - Transaction context
    /// 
    /// # Panics
    /// * E_EMPTY_COMMENT - If the comment content is empty
    /// 
    /// # Comment Creation Flow
    /// Comments are separate objects owned by the commenter, allowing for
    /// true ownership of user-generated content. The comment is linked to
    /// the parent Suit via the suit_id field, enabling queries for all
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
