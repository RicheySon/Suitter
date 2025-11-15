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

    fun init(ctx: &mut tx_context::TxContext) {
        let registry = UsernameRegistry {
            id: object::new(ctx),
            usernames: table::new(ctx),
        };
        transfer::share_object(registry);
    }

    // ===== Public Functions =====


    public fun create_profile(
        registry: &mut UsernameRegistry,
        username: vector<u8>,
        bio: vector<u8>,
        pfp_url: vector<u8>,
        ctx: &mut tx_context::TxContext
    ): Profile {
        let sender_addr = tx_context::sender(ctx);
        let username_string = utf8(username);
        
        let username_length = std::string::length(&username_string);
        assert!(username_length >= 3 && username_length <= 20, E_INVALID_USERNAME);
        
        assert!(!table::contains(&registry.usernames, username_string), E_USERNAME_TAKEN);
        
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

        table::add(&mut registry.usernames, profile.username, sender_addr);

        event::emit(ProfileCreated {
            profile_id: object::id(&profile),
            owner: sender_addr,
            username: profile.username,
            timestamp: 0, 
        });

        profile
    }

    public fun update_profile(
        profile: &mut Profile,
        registry: &mut UsernameRegistry,
        username: vector<u8>,
        bio: vector<u8>,
        pfp_url: vector<u8>,
        ctx: &mut tx_context::TxContext
    ) {
        let sender_addr = tx_context::sender(ctx);
        
        assert!(profile.owner == sender_addr, E_NOT_PROFILE_OWNER);
        
        let new_username = utf8(username);
        
        if (new_username != profile.username) {
            let username_length = std::string::length(&new_username);
            assert!(username_length >= 3 && username_length <= 20, E_INVALID_USERNAME);
            
            assert!(!table::contains(&registry.usernames, new_username), E_USERNAME_TAKEN);
            
            table::remove(&mut registry.usernames, profile.username);
            
            table::add(&mut registry.usernames, new_username, sender_addr);
            
            profile.username = new_username;
        };
        
        profile.bio = utf8(bio);
        profile.pfp_url = utf8(pfp_url);
        
        event::emit(ProfileUpdated {
            profile_id: object::id(profile),
            owner: profile.owner,
            timestamp: 0, 
        });
    }

    // ===== Query Functions =====


    public fun check_username_available(
        registry: &UsernameRegistry,
        username: vector<u8>
    ): bool {
        let username_string = utf8(username);
        !table::contains(&registry.usernames, username_string)
    }


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
