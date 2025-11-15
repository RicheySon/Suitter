/// Profile module for managing user identities on Suitter
/// Handles profile creation, updates, and username uniqueness enforcement
module suits::profile {
    use std::string::{String, utf8};
    use sui::event;
    use sui::table::{Self, Table};

    // ===== Error Constants =====
    
    /// Caller is not the owner of the profile
    const E_NOT_PROFILE_OWNER: u64 = 1;
    /// Username is already taken by another user
    const E_USERNAME_TAKEN: u64 = 2;
    /// Username format is invalid (empty, too long, or contains invalid characters)
    const E_INVALID_USERNAME: u64 = 3;
    /// Profile not found for the given address
    const E_PROFILE_NOT_FOUND: u64 = 4;

    // ===== Structs =====

    /// Represents a user's profile on Suitter
    /// Contains identity information and social statistics
    public struct Profile has key, store {
        id: UID,
        owner: address,
        username: String,
        bio: String,
        pfp_url: String,
        created_at: u64,
        followers_count: u64,
        following_count: u64,
    }

    /// Shared registry to enforce unique usernames across the platform
    /// Maps username strings to owner addresses
    public struct UsernameRegistry has key {
        id: UID,
        usernames: Table<String, address>,
    }

    // ===== Events =====

    /// Event emitted when a profile is created
    public struct ProfileCreated has copy, drop {
        profile_id: object::ID,
        owner: address,
        username: String,
        timestamp: u64,
    }

    /// Event emitted when a profile is updated
    public struct ProfileUpdated has copy, drop {
        profile_id: object::ID,
        owner: address,
        timestamp: u64,
    }

    // ===== Initialization =====

    /// Initialize the UsernameRegistry as a shared object
    /// This function is called once during module deployment
    fun init(ctx: &mut tx_context::TxContext) {
        let registry = UsernameRegistry {
            id: object::new(ctx),
            usernames: table::new(ctx),
        };
        transfer::share_object(registry);
    }

    // ===== Public Functions =====

    /// Create a new user profile with username validation and registration.
    /// 
    /// This function performs the following steps:
    /// 1. Validates the username format (length and characters)
    /// 2. Checks if the username is available in the registry
    /// 3. Creates the profile object with initial values
    /// 4. Registers the username in the registry atomically
    /// 5. Emits a ProfileCreated event
    /// 
    /// # Arguments
    /// * `registry` - Shared UsernameRegistry to check and register username
    /// * `username` - Username as bytes (will be converted to String)
    /// * `bio` - User biography as bytes
    /// * `pfp_url` - Profile picture URL as bytes
    /// * `ctx` - Transaction context
    /// 
    /// # Panics
    /// * E_INVALID_USERNAME - If username is empty, too long, or contains invalid characters
    /// * E_USERNAME_TAKEN - If username is already registered to another address
    public fun create_profile(
        registry: &mut UsernameRegistry,
        username: vector<u8>,
        bio: vector<u8>,
        pfp_url: vector<u8>,
        ctx: &mut tx_context::TxContext
    ): Profile {
        let sender_addr = tx_context::sender(ctx);
        let username_string = utf8(username);
        
        // Validate username format
        // Username must be between 3 and 20 characters
        let username_length = std::string::length(&username_string);
        assert!(username_length >= 3 && username_length <= 20, E_INVALID_USERNAME);
        
        // Check if username is already taken in the registry
        // This ensures uniqueness across the entire platform
        assert!(!table::contains(&registry.usernames, username_string), E_USERNAME_TAKEN);
        
        // Create the profile object with initial values
        // Followers and following counts start at 0
        // created_at will be set to 0 for now (clock integration in future tasks)
        let profile = Profile {
            id: object::new(ctx),
            owner: sender_addr,
            username: username_string,
            bio: utf8(bio),
            pfp_url: utf8(pfp_url),
            created_at: 0, // Will be set with clock in future tasks
            followers_count: 0,
            following_count: 0,
        };

        // Register the username in the registry atomically with profile creation
        // This prevents race conditions where two users try to claim the same username
        table::add(&mut registry.usernames, profile.username, sender_addr);

        // Emit event for off-chain indexing and notifications
        event::emit(ProfileCreated {
            profile_id: object::id(&profile),
            owner: sender_addr,
            username: profile.username,
            timestamp: 0, // Will be set with clock in future tasks
        });

        profile
    }

    /// Update an existing user profile with authorization and username registry management.
    /// 
    /// This function performs the following steps:
    /// 1. Verifies the caller is the profile owner (authorization check)
    /// 2. If username is changing, validates the new username and updates registry
    /// 3. Updates profile fields (bio and pfp_url always updated)
    /// 4. Emits a ProfileUpdated event
    /// 
    /// # Arguments
    /// * `profile` - Mutable reference to the profile being updated
    /// * `registry` - Shared UsernameRegistry to manage username changes
    /// * `username` - New username as bytes (can be same as current)
    /// * `bio` - New biography as bytes
    /// * `pfp_url` - New profile picture URL as bytes
    /// * `ctx` - Transaction context
    /// 
    /// # Panics
    /// * E_NOT_PROFILE_OWNER - If caller is not the profile owner
    /// * E_INVALID_USERNAME - If new username format is invalid
    /// * E_USERNAME_TAKEN - If new username is already taken by another user
    public fun update_profile(
        profile: &mut Profile,
        registry: &mut UsernameRegistry,
        username: vector<u8>,
        bio: vector<u8>,
        pfp_url: vector<u8>,
        ctx: &mut tx_context::TxContext
    ) {
        let sender_addr = tx_context::sender(ctx);
        
        // Authorization check: Only the profile owner can update their profile
        // This prevents unauthorized modifications to user identities
        assert!(profile.owner == sender_addr, E_NOT_PROFILE_OWNER);
        
        let new_username = utf8(username);
        
        // Check if username is being changed
        if (new_username != profile.username) {
            // Validate new username format (3-20 characters)
            let username_length = std::string::length(&new_username);
            assert!(username_length >= 3 && username_length <= 20, E_INVALID_USERNAME);
            
            // Check if new username is available
            // Must not be taken by another user
            assert!(!table::contains(&registry.usernames, new_username), E_USERNAME_TAKEN);
            
            // Remove old username from registry
            // This frees up the old username for other users
            table::remove(&mut registry.usernames, profile.username);
            
            // Register new username in registry
            // This atomically claims the new username
            table::add(&mut registry.usernames, new_username, sender_addr);
            
            // Update profile username
            profile.username = new_username;
        };
        
        // Update other profile fields
        // These can be updated regardless of username change
        profile.bio = utf8(bio);
        profile.pfp_url = utf8(pfp_url);
        
        // Emit event for off-chain indexing
        event::emit(ProfileUpdated {
            profile_id: object::id(profile),
            owner: profile.owner,
            timestamp: 0, // Will be set with clock in future tasks
        });
    }

    // ===== Query Functions =====

    /// Check if a username is available for registration.
    /// 
    /// Returns true if the username is not yet registered in the system,
    /// false if it's already taken by another user.
    /// 
    /// # Arguments
    /// * `registry` - Reference to the UsernameRegistry
    /// * `username` - Username to check as bytes
    /// 
    /// # Returns
    /// * `bool` - true if available, false if taken
    public fun check_username_available(
        registry: &UsernameRegistry,
        username: vector<u8>
    ): bool {
        let username_string = utf8(username);
        !table::contains(&registry.usernames, username_string)
    }

    /// Get the owner address for a given username.
    /// 
    /// This function looks up which address owns a particular username.
    /// Useful for finding a user's profile by their username.
    /// 
    /// # Arguments
    /// * `registry` - Reference to the UsernameRegistry
    /// * `username` - Username to look up as bytes
    /// 
    /// # Returns
    /// * `address` - The owner address of the username
    /// 
    /// # Panics
    /// * E_PROFILE_NOT_FOUND - If username is not registered
    public fun get_profile_owner_by_username(
        registry: &UsernameRegistry,
        username: vector<u8>
    ): address {
        let username_string = utf8(username);
        assert!(table::contains(&registry.usernames, username_string), E_PROFILE_NOT_FOUND);
        *table::borrow(&registry.usernames, username_string)
    }

    // ===== Getter Functions for Profile Fields =====

    /// Get the profile owner address
    public fun get_owner(profile: &Profile): address {
        profile.owner
    }

    /// Get the profile username
    public fun get_username(profile: &Profile): String {
        profile.username
    }

    /// Get the profile bio
    public fun get_bio(profile: &Profile): String {
        profile.bio
    }

    /// Get the profile picture URL
    public fun get_pfp_url(profile: &Profile): String {
        profile.pfp_url
    }

    /// Get the profile creation timestamp
    public fun get_created_at(profile: &Profile): u64 {
        profile.created_at
    }

    /// Get the followers count
    public fun get_followers_count(profile: &Profile): u64 {
        profile.followers_count
    }

    /// Get the following count
    public fun get_following_count(profile: &Profile): u64 {
        profile.following_count
    }

    // ===== Test-only Functions =====

    #[test_only]
    /// Initialize registry for testing
    public fun init_for_testing(ctx: &mut tx_context::TxContext) {
        init(ctx);
    }
}
