#[test_only]
module suits::suits_tests {
    use sui::test_scenario::{Self as ts};
    use sui::clock::{Self};
    use sui::coin::{Self};
    use sui::sui::SUI;
    use std::string::{utf8};
    
    use suits::profile::{Self, UsernameRegistry};
    use suits::suits::{Self, Suit, SuitRegistry};
    use suits::interactions::{Self, Like, Comment, InteractionRegistry};
    use suits::tipping::{Self, TipBalance, TipBalanceRegistry};
    use suits::messaging::{Self, Chat, ChatRegistry};

    // Test addresses
    const ADMIN: address = @0xAD;
    const ALICE: address = @0xA11CE;
    const BOB: address = @0xB0B;

    // ===== Profile Module Tests =====

    #[test]
    fun test_create_profile_success() {
        let mut scenario = ts::begin(ALICE);
        
        // Initialize profile module
        {
            ts::next_tx(&mut scenario, ADMIN);
            profile::init_for_testing(ts::ctx(&mut scenario));
        };
        
        // Alice creates a profile
        {
            ts::next_tx(&mut scenario, ALICE);
            let mut registry = ts::take_shared<UsernameRegistry>(&scenario);
            
            let profile = profile::create_profile(
                &mut registry,
                b"alice",
                b"Hello, I'm Alice!",
                b"https://example.com/alice.jpg",
                ts::ctx(&mut scenario)
            );
            
            // Verify profile fields
            assert!(profile::get_username(&profile) == utf8(b"alice"), 0);
            assert!(profile::get_bio(&profile) == utf8(b"Hello, I'm Alice!"), 1);
            assert!(profile::get_owner(&profile) == ALICE, 2);
            
            transfer::public_transfer(profile, ALICE);
            ts::return_shared(registry);
        };
        
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = profile::E_USERNAME_TAKEN)]
    fun test_create_profile_duplicate_username() {
        let mut scenario = ts::begin(ALICE);
        
        // Initialize profile module
        {
            ts::next_tx(&mut scenario, ADMIN);
            profile::init_for_testing(ts::ctx(&mut scenario));
        };
        
        // Alice creates a profile
        {
            ts::next_tx(&mut scenario, ALICE);
            let mut registry = ts::take_shared<UsernameRegistry>(&scenario);
            
            let profile = profile::create_profile(
                &mut registry,
                b"alice",
                b"Hello, I'm Alice!",
                b"https://example.com/alice.jpg",
                ts::ctx(&mut scenario)
            );
            
            transfer::public_transfer(profile, ALICE);
            ts::return_shared(registry);
        };
        
        // Bob tries to use the same username - should fail
        {
            ts::next_tx(&mut scenario, BOB);
            let mut registry = ts::take_shared<UsernameRegistry>(&scenario);
            
            let profile = profile::create_profile(
                &mut registry,
                b"alice", // Same username
                b"I'm Bob",
                b"https://example.com/bob.jpg",
                ts::ctx(&mut scenario)
            );
            
            transfer::public_transfer(profile, BOB);
            ts::return_shared(registry);
        };
        
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = profile::E_INVALID_USERNAME)]
    fun test_create_profile_invalid_username() {
        let mut scenario = ts::begin(ALICE);
        
        // Initialize profile module
        {
            ts::next_tx(&mut scenario, ADMIN);
            profile::init_for_testing(ts::ctx(&mut scenario));
        };
        
        // Alice tries to create profile with too short username
        {
            ts::next_tx(&mut scenario, ALICE);
            let mut registry = ts::take_shared<UsernameRegistry>(&scenario);
            
            let profile = profile::create_profile(
                &mut registry,
                b"ab", // Too short (< 3 characters)
                b"Hello",
                b"https://example.com/alice.jpg",
                ts::ctx(&mut scenario)
            );
            
            transfer::public_transfer(profile, ALICE);
            ts::return_shared(registry);
        };
        
        ts::end(scenario);
    }

    // ===== Suits Module Tests =====

    #[test]
    fun test_create_suit_success() {
        let mut scenario = ts::begin(ALICE);
        let clock = clock::create_for_testing(ts::ctx(&mut scenario));
        
        // Initialize suits module
        {
            ts::next_tx(&mut scenario, ADMIN);
            suits::init_for_testing(ts::ctx(&mut scenario));
        };
        
        // Alice creates a Suit
        {
            ts::next_tx(&mut scenario, ALICE);
            let mut registry = ts::take_shared<SuitRegistry>(&scenario);
            
            suits::create_suit(
                &mut registry,
                b"Hello World! This is my first Suit.",
                vector::empty(),
                &clock,
                ts::ctx(&mut scenario)
            );
            
            ts::return_shared(registry);
        };
        
        // Verify Suit was created
        {
            ts::next_tx(&mut scenario, ALICE);
            let suit = ts::take_shared<Suit>(&scenario);
            
            assert!(suits::get_creator(&suit) == ALICE, 0);
            assert!(suits::get_content(&suit) == utf8(b"Hello World! This is my first Suit."), 1);
            assert!(suits::get_like_count(&suit) == 0, 2);
            assert!(suits::get_comment_count(&suit) == 0, 3);
            
            ts::return_shared(suit);
        };
        
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = suits::E_EMPTY_CONTENT)]
    fun test_create_suit_empty_content() {
        let mut scenario = ts::begin(ALICE);
        let clock = clock::create_for_testing(ts::ctx(&mut scenario));
        
        // Initialize suits module
        {
            ts::next_tx(&mut scenario, ADMIN);
            suits::init_for_testing(ts::ctx(&mut scenario));
        };
        
        // Alice tries to create Suit with empty content
        {
            ts::next_tx(&mut scenario, ALICE);
            let mut registry = ts::take_shared<SuitRegistry>(&scenario);
            
            suits::create_suit(
                &mut registry,
                b"", // Empty content
                vector::empty(),
                &clock,
                ts::ctx(&mut scenario)
            );
            
            ts::return_shared(registry);
        };
        
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    // ===== Interactions Module Tests =====

    #[test]
    fun test_like_suit_success() {
        let mut scenario = ts::begin(ALICE);
        let clock = clock::create_for_testing(ts::ctx(&mut scenario));
        
        // Initialize modules
        {
            ts::next_tx(&mut scenario, ADMIN);
            suits::init_for_testing(ts::ctx(&mut scenario));
            interactions::init_for_testing(ts::ctx(&mut scenario));
        };
        
        // Alice creates a Suit
        {
            ts::next_tx(&mut scenario, ALICE);
            let mut registry = ts::take_shared<SuitRegistry>(&scenario);
            
            suits::create_suit(
                &mut registry,
                b"Check out my Suit!",
                vector::empty(),
                &clock,
                ts::ctx(&mut scenario)
            );
            
            ts::return_shared(registry);
        };
        
        // Bob likes Alice's Suit
        {
            ts::next_tx(&mut scenario, BOB);
            let mut suit = ts::take_shared<Suit>(&scenario);
            let mut registry = ts::take_shared<InteractionRegistry>(&scenario);
            
            interactions::like_suit(&mut suit, &mut registry, &clock, ts::ctx(&mut scenario));
            
            // Verify like count increased
            assert!(suits::get_like_count(&suit) == 1, 0);
            
            ts::return_shared(suit);
            ts::return_shared(registry);
        };
        
        // Verify Like object was created
        {
            ts::next_tx(&mut scenario, BOB);
            let like = ts::take_from_sender<Like>(&scenario);
            
            assert!(interactions::get_like_liker(&like) == BOB, 0);
            
            ts::return_to_sender(&scenario, like);
        };
        
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = interactions::E_CANNOT_LIKE_OWN_SUIT)]
    fun test_like_own_suit_fails() {
        let mut scenario = ts::begin(ALICE);
        let clock = clock::create_for_testing(ts::ctx(&mut scenario));
        
        // Initialize modules
        {
            ts::next_tx(&mut scenario, ADMIN);
            suits::init_for_testing(ts::ctx(&mut scenario));
            interactions::init_for_testing(ts::ctx(&mut scenario));
        };
        
        // Alice creates a Suit
        {
            ts::next_tx(&mut scenario, ALICE);
            let mut registry = ts::take_shared<SuitRegistry>(&scenario);
            
            suits::create_suit(
                &mut registry,
                b"My Suit",
                vector::empty(),
                &clock,
                ts::ctx(&mut scenario)
            );
            
            ts::return_shared(registry);
        };
        
        // Alice tries to like her own Suit - should fail
        {
            ts::next_tx(&mut scenario, ALICE);
            let mut suit = ts::take_shared<Suit>(&scenario);
            let mut registry = ts::take_shared<InteractionRegistry>(&scenario);
            
            interactions::like_suit(&mut suit, &mut registry, &clock, ts::ctx(&mut scenario));
            
            ts::return_shared(suit);
            ts::return_shared(registry);
        };
        
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_comment_on_suit_success() {
        let mut scenario = ts::begin(ALICE);
        let clock = clock::create_for_testing(ts::ctx(&mut scenario));
        
        // Initialize modules
        {
            ts::next_tx(&mut scenario, ADMIN);
            suits::init_for_testing(ts::ctx(&mut scenario));
            interactions::init_for_testing(ts::ctx(&mut scenario));
        };
        
        // Alice creates a Suit
        {
            ts::next_tx(&mut scenario, ALICE);
            let mut registry = ts::take_shared<SuitRegistry>(&scenario);
            
            suits::create_suit(
                &mut registry,
                b"What do you think?",
                vector::empty(),
                &clock,
                ts::ctx(&mut scenario)
            );
            
            ts::return_shared(registry);
        };
        
        // Bob comments on Alice's Suit
        {
            ts::next_tx(&mut scenario, BOB);
            let mut suit = ts::take_shared<Suit>(&scenario);
            
            interactions::comment_on_suit(
                &mut suit,
                b"Great Suit!",
                &clock,
                ts::ctx(&mut scenario)
            );
            
            // Verify comment count increased
            assert!(suits::get_comment_count(&suit) == 1, 0);
            
            ts::return_shared(suit);
        };
        
        // Verify Comment object was created
        {
            ts::next_tx(&mut scenario, BOB);
            let comment = ts::take_from_sender<Comment>(&scenario);
            
            assert!(interactions::get_comment_commenter(&comment) == BOB, 0);
            assert!(interactions::get_comment_content(&comment) == utf8(b"Great Suit!"), 1);
            
            ts::return_to_sender(&scenario, comment);
        };
        
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    // ===== Tipping Module Tests =====

    #[test]
    fun test_tip_suit_success() {
        let mut scenario = ts::begin(ALICE);
        let clock = clock::create_for_testing(ts::ctx(&mut scenario));
        
        // Initialize modules
        {
            ts::next_tx(&mut scenario, ADMIN);
            suits::init_for_testing(ts::ctx(&mut scenario));
            tipping::init_for_testing(ts::ctx(&mut scenario));
        };
        
        // Alice creates a Suit
        {
            ts::next_tx(&mut scenario, ALICE);
            let mut registry = ts::take_shared<SuitRegistry>(&scenario);
            
            suits::create_suit(
                &mut registry,
                b"Amazing content!",
                vector::empty(),
                &clock,
                ts::ctx(&mut scenario)
            );
            
            ts::return_shared(registry);
        };
        
        // Create TipBalance for Alice
        {
            ts::next_tx(&mut scenario, ALICE);
            let mut registry = ts::take_shared<TipBalanceRegistry>(&scenario);
            
            tipping::create_tip_balance(&mut registry, ts::ctx(&mut scenario));
            
            ts::return_shared(registry);
        };
        
        // Bob tips Alice's Suit
        {
            ts::next_tx(&mut scenario, BOB);
            let mut suit = ts::take_shared<Suit>(&scenario);
            let mut tip_balance = ts::take_shared<TipBalance>(&scenario);
            
            // Create a coin for the tip (0.1 SUI = 100_000_000 MIST)
            let payment = coin::mint_for_testing<SUI>(100_000_000, ts::ctx(&mut scenario));
            
            tipping::tip_suit(
                &mut suit,
                &mut tip_balance,
                payment,
                &clock,
                ts::ctx(&mut scenario)
            );
            
            // Verify tip was recorded
            assert!(suits::get_tip_total(&suit) == 100_000_000, 0);
            assert!(tipping::get_balance(&tip_balance) == 100_000_000, 1);
            assert!(tipping::get_total_received(&tip_balance) == 100_000_000, 2);
            
            ts::return_shared(suit);
            ts::return_shared(tip_balance);
        };
        
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = tipping::E_CANNOT_TIP_SELF)]
    fun test_tip_own_suit_fails() {
        let mut scenario = ts::begin(ALICE);
        let clock = clock::create_for_testing(ts::ctx(&mut scenario));
        
        // Initialize modules
        {
            ts::next_tx(&mut scenario, ADMIN);
            suits::init_for_testing(ts::ctx(&mut scenario));
            tipping::init_for_testing(ts::ctx(&mut scenario));
        };
        
        // Alice creates a Suit
        {
            ts::next_tx(&mut scenario, ALICE);
            let mut registry = ts::take_shared<SuitRegistry>(&scenario);
            
            suits::create_suit(
                &mut registry,
                b"My content",
                vector::empty(),
                &clock,
                ts::ctx(&mut scenario)
            );
            
            ts::return_shared(registry);
        };
        
        // Create TipBalance for Alice
        {
            ts::next_tx(&mut scenario, ALICE);
            let mut registry = ts::take_shared<TipBalanceRegistry>(&scenario);
            
            tipping::create_tip_balance(&mut registry, ts::ctx(&mut scenario));
            
            ts::return_shared(registry);
        };
        
        // Alice tries to tip her own Suit - should fail
        {
            ts::next_tx(&mut scenario, ALICE);
            let mut suit = ts::take_shared<Suit>(&scenario);
            let mut tip_balance = ts::take_shared<TipBalance>(&scenario);
            
            let payment = coin::mint_for_testing<SUI>(100_000_000, ts::ctx(&mut scenario));
            
            tipping::tip_suit(
                &mut suit,
                &mut tip_balance,
                payment,
                &clock,
                ts::ctx(&mut scenario)
            );
            
            ts::return_shared(suit);
            ts::return_shared(tip_balance);
        };
        
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    // ===== Messaging Module Tests =====

    #[test]
    fun test_start_chat_and_send_message() {
        let mut scenario = ts::begin(ALICE);
        let clock = clock::create_for_testing(ts::ctx(&mut scenario));
        
        // Initialize messaging module
        {
            ts::next_tx(&mut scenario, ADMIN);
            messaging::init_for_testing(ts::ctx(&mut scenario));
        };
        
        // Alice starts a chat with Bob
        {
            ts::next_tx(&mut scenario, ALICE);
            let mut registry = ts::take_shared<ChatRegistry>(&scenario);
            
            messaging::start_chat(BOB, &mut registry, &clock, ts::ctx(&mut scenario));
            
            ts::return_shared(registry);
        };
        
        // Alice sends a message to Bob
        {
            ts::next_tx(&mut scenario, ALICE);
            let mut chat = ts::take_shared<Chat>(&scenario);
            
            messaging::send_message(
                &mut chat,
                b"encrypted_message_content",
                b"content_hash",
                &clock,
                ts::ctx(&mut scenario)
            );
            
            // Verify message was sent
            let messages = messaging::get_conversation_messages(&chat);
            assert!(vector::length(messages) == 1, 0);
            
            ts::return_shared(chat);
        };
        
        // Verify unread count for Bob
        {
            ts::next_tx(&mut scenario, BOB);
            let chat = ts::take_shared<Chat>(&scenario);
            
            let unread_count = messaging::get_unread_count(&chat, BOB);
            assert!(unread_count == 1, 0);
            
            ts::return_shared(chat);
        };
        
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = messaging::E_CANNOT_MESSAGE_SELF)]
    fun test_start_chat_with_self_fails() {
        let mut scenario = ts::begin(ALICE);
        let clock = clock::create_for_testing(ts::ctx(&mut scenario));
        
        // Initialize messaging module
        {
            ts::next_tx(&mut scenario, ADMIN);
            messaging::init_for_testing(ts::ctx(&mut scenario));
        };
        
        // Alice tries to start a chat with herself - should fail
        {
            ts::next_tx(&mut scenario, ALICE);
            let mut registry = ts::take_shared<ChatRegistry>(&scenario);
            
            messaging::start_chat(ALICE, &mut registry, &clock, ts::ctx(&mut scenario));
            
            ts::return_shared(registry);
        };
        
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_mark_message_as_read() {
        let mut scenario = ts::begin(ALICE);
        let clock = clock::create_for_testing(ts::ctx(&mut scenario));
        
        // Initialize messaging module
        {
            ts::next_tx(&mut scenario, ADMIN);
            messaging::init_for_testing(ts::ctx(&mut scenario));
        };
        
        // Alice starts a chat with Bob
        {
            ts::next_tx(&mut scenario, ALICE);
            let mut registry = ts::take_shared<ChatRegistry>(&scenario);
            
            messaging::start_chat(BOB, &mut registry, &clock, ts::ctx(&mut scenario));
            
            ts::return_shared(registry);
        };
        
        // Alice sends a message
        {
            ts::next_tx(&mut scenario, ALICE);
            let mut chat = ts::take_shared<Chat>(&scenario);
            
            messaging::send_message(
                &mut chat,
                b"Hello Bob!",
                b"hash",
                &clock,
                ts::ctx(&mut scenario)
            );
            
            ts::return_shared(chat);
        };
        
        // Bob marks the message as read
        {
            ts::next_tx(&mut scenario, BOB);
            let mut chat = ts::take_shared<Chat>(&scenario);
            
            messaging::mark_as_read(&mut chat, 0, &clock, ts::ctx(&mut scenario));
            
            // Verify unread count is now 0
            let unread_count = messaging::get_unread_count(&chat, BOB);
            assert!(unread_count == 0, 0);
            
            ts::return_shared(chat);
        };
        
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }
}
