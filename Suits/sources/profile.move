
#[allow(lint(self_transfer))]
module suits::profile {
    use std::string::{Self, String};
    use sui::event;

    // The user profile object
    public struct Profile has key, store {
        id: UID,
        owner: address,
        username: String,
        bio: String,
        pfp_url: String,
    }

    // Event for when a profile is created
    public struct ProfileCreated has copy, drop {
        profile_id: ID,
        owner: address,
        username: String,
    }

    // ===== Public Functions =====

    /// Create a new user profile.
    public fun create_profile(
        username: vector<u8>,
        bio: vector<u8>,
        pfp_url: vector<u8>,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let profile = Profile {
            id: object::new(ctx),
            owner: sender,
            username: string::utf8(username),
            bio: string::utf8(bio),
            pfp_url: string::utf8(pfp_url),
        };

        event::emit(ProfileCreated {
            profile_id: object::id(&profile),
            owner: sender,
            username: profile.username,
        });

        transfer::public_transfer(profile, sender);
    }

    /// Update an existing user profile.
    public fun update_profile(
        profile: &mut Profile,
        username: vector<u8>,
        bio: vector<u8>,
        pfp_url: vector<u8>,
        ctx: &mut TxContext
    ) {
        assert!(profile.owner == tx_context::sender(ctx), ENotProfileOwner);
        profile.username = string::utf8(username);
        profile.bio = string::utf8(bio);
        profile.pfp_url = string::utf8(pfp_url);
    }

    // ===== Errors =====
    const ENotProfileOwner: u64 = 0;
}