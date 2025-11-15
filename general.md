module 0x95593861a7d92b0a9470e02aab1e4a1cda6646e5fd84ef66c37045fe54e446f7::interactions {
    struct Like has store, key {
        id: 0x2::object::UID,
        suit_id: 0x2::object::ID,
        liker: address,
        created_at: u64,
    }
    
    struct Comment has store, key {
        id: 0x2::object::UID,
        suit_id: 0x2::object::ID,
        commenter: address,
        content: 0x1::string::String,
        created_at: u64,
    }
    
    struct Retweet has store, key {
        id: 0x2::object::UID,
        original_suit_id: 0x2::object::ID,
        retweeter: address,
        created_at: u64,
    }
    
    struct InteractionRegistry has key {
        id: 0x2::object::UID,
        likes: 0x2::table::Table<vector<u8>, bool>,
        retweets: 0x2::table::Table<vector<u8>, bool>,
    }
    
    struct LikeCreated has copy, drop {
        like_id: 0x2::object::ID,
        suit_id: 0x2::object::ID,
        liker: address,
        timestamp: u64,
    }
    
    struct CommentCreated has copy, drop {
        comment_id: 0x2::object::ID,
        suit_id: 0x2::object::ID,
        commenter: address,
        timestamp: u64,
    }
    
    struct RetweetCreated has copy, drop {
        retweet_id: 0x2::object::ID,
        original_suit_id: 0x2::object::ID,
        retweeter: address,
        timestamp: u64,
    }
    
    public fun comment_on_suit(arg0: &mut 0x95593861a7d92b0a9470e02aab1e4a1cda6646e5fd84ef66c37045fe54e446f7::suits::Suit, arg1: vector<u8>, arg2: &0x2::clock::Clock, arg3: &mut 0x2::tx_context::TxContext) {
        let v0 = 0x2::tx_context::sender(arg3);
        let v1 = 0x2::object::id<0x95593861a7d92b0a9470e02aab1e4a1cda6646e5fd84ef66c37045fe54e446f7::suits::Suit>(arg0);
        let v2 = 0x1::string::utf8(arg1);
        assert!(0x1::string::length(&v2) > 0, 25);
        let v3 = 0x2::clock::timestamp_ms(arg2);
        let v4 = Comment{
            id         : 0x2::object::new(arg3), 
            suit_id    : v1, 
            commenter  : v0, 
            content    : v2, 
            created_at : v3,
        };
        0x95593861a7d92b0a9470e02aab1e4a1cda6646e5fd84ef66c37045fe54e446f7::suits::increment_comment_count(arg0);
        let v5 = CommentCreated{
            comment_id : 0x2::object::id<Comment>(&v4), 
            suit_id    : v1, 
            commenter  : v0, 
            timestamp  : v3,
        };
        0x2::event::emit<CommentCreated>(v5);
        0x2::transfer::transfer<Comment>(v4, v0);
    }
    
    fun create_interaction_key(arg0: 0x2::object::ID, arg1: address) : vector<u8> {
        let v0 = 0x2::bcs::to_bytes<0x2::object::ID>(&arg0);
        0x1::vector::append<u8>(&mut v0, 0x2::bcs::to_bytes<address>(&arg1));
        v0
    }
    
    public fun get_comment_commenter(arg0: &Comment) : address {
        arg0.commenter
    }
    
    public fun get_comment_content(arg0: &Comment) : 0x1::string::String {
        arg0.content
    }
    
    public fun get_comment_created_at(arg0: &Comment) : u64 {
        arg0.created_at
    }
    
    public fun get_comment_suit_id(arg0: &Comment) : 0x2::object::ID {
        arg0.suit_id
    }
    
    public fun get_like_created_at(arg0: &Like) : u64 {
        arg0.created_at
    }
    
    public fun get_like_liker(arg0: &Like) : address {
        arg0.liker
    }
    
    public fun get_like_suit_id(arg0: &Like) : 0x2::object::ID {
        arg0.suit_id
    }
    
    public fun get_retweet_created_at(arg0: &Retweet) : u64 {
        arg0.created_at
    }
    
    public fun get_retweet_retweeter(arg0: &Retweet) : address {
        arg0.retweeter
    }
    
    public fun get_retweet_suit_id(arg0: &Retweet) : 0x2::object::ID {
        arg0.original_suit_id
    }
    
    public fun has_user_liked(arg0: &InteractionRegistry, arg1: 0x2::object::ID, arg2: address) : bool {
        0x2::table::contains<vector<u8>, bool>(&arg0.likes, create_interaction_key(arg1, arg2))
    }
    
    public fun has_user_retweeted(arg0: &InteractionRegistry, arg1: 0x2::object::ID, arg2: address) : bool {
        0x2::table::contains<vector<u8>, bool>(&arg0.retweets, create_interaction_key(arg1, arg2))
    }
    
    fun init(arg0: &mut 0x2::tx_context::TxContext) {
        let v0 = InteractionRegistry{
            id       : 0x2::object::new(arg0), 
            likes    : 0x2::table::new<vector<u8>, bool>(arg0), 
            retweets : 0x2::table::new<vector<u8>, bool>(arg0),
        };
        0x2::transfer::share_object<InteractionRegistry>(v0);
    }
    
    public fun like_suit(arg0: &mut 0x95593861a7d92b0a9470e02aab1e4a1cda6646e5fd84ef66c37045fe54e446f7::suits::Suit, arg1: &mut InteractionRegistry, arg2: &0x2::clock::Clock, arg3: &mut 0x2::tx_context::TxContext) {
        let v0 = 0x2::tx_context::sender(arg3);
        let v1 = 0x2::object::id<0x95593861a7d92b0a9470e02aab1e4a1cda6646e5fd84ef66c37045fe54e446f7::suits::Suit>(arg0);
        assert!(v0 != 0x95593861a7d92b0a9470e02aab1e4a1cda6646e5fd84ef66c37045fe54e446f7::suits::get_creator(arg0), 24);
        let v2 = create_interaction_key(v1, v0);
        assert!(!0x2::table::contains<vector<u8>, bool>(&arg1.likes, v2), 20);
        let v3 = 0x2::clock::timestamp_ms(arg2);
        let v4 = Like{
            id         : 0x2::object::new(arg3), 
            suit_id    : v1, 
            liker      : v0, 
            created_at : v3,
        };
        0x2::table::add<vector<u8>, bool>(&mut arg1.likes, v2, true);
        0x95593861a7d92b0a9470e02aab1e4a1cda6646e5fd84ef66c37045fe54e446f7::suits::increment_like_count(arg0);
        let v5 = LikeCreated{
            like_id   : 0x2::object::id<Like>(&v4), 
            suit_id   : v1, 
            liker     : v0, 
            timestamp : v3,
        };
        0x2::event::emit<LikeCreated>(v5);
        0x2::transfer::transfer<Like>(v4, v0);
    }
    
    public fun retweet_suit(arg0: &mut 0x95593861a7d92b0a9470e02aab1e4a1cda6646e5fd84ef66c37045fe54e446f7::suits::Suit, arg1: &mut InteractionRegistry, arg2: &0x2::clock::Clock, arg3: &mut 0x2::tx_context::TxContext) {
        let v0 = 0x2::tx_context::sender(arg3);
        let v1 = 0x2::object::id<0x95593861a7d92b0a9470e02aab1e4a1cda6646e5fd84ef66c37045fe54e446f7::suits::Suit>(arg0);
        assert!(v0 != 0x95593861a7d92b0a9470e02aab1e4a1cda6646e5fd84ef66c37045fe54e446f7::suits::get_creator(arg0), 24);
        let v2 = create_interaction_key(v1, v0);
        assert!(!0x2::table::contains<vector<u8>, bool>(&arg1.retweets, v2), 22);
        let v3 = 0x2::clock::timestamp_ms(arg2);
        let v4 = Retweet{
            id               : 0x2::object::new(arg3), 
            original_suit_id : v1, 
            retweeter        : v0, 
            created_at       : v3,
        };
        0x2::table::add<vector<u8>, bool>(&mut arg1.retweets, v2, true);
        0x95593861a7d92b0a9470e02aab1e4a1cda6646e5fd84ef66c37045fe54e446f7::suits::increment_retweet_count(arg0);
        let v5 = RetweetCreated{
            retweet_id       : 0x2::object::id<Retweet>(&v4), 
            original_suit_id : v1, 
            retweeter        : v0, 
            timestamp        : v3,
        };
        0x2::event::emit<RetweetCreated>(v5);
        0x2::transfer::transfer<Retweet>(v4, v0);
    }
    
    public fun unlike_suit(arg0: &mut 0x95593861a7d92b0a9470e02aab1e4a1cda6646e5fd84ef66c37045fe54e446f7::suits::Suit, arg1: Like, arg2: &mut InteractionRegistry, arg3: &mut 0x2::tx_context::TxContext) {
        let v0 = 0x2::object::id<0x95593861a7d92b0a9470e02aab1e4a1cda6646e5fd84ef66c37045fe54e446f7::suits::Suit>(arg0);
        assert!(arg1.suit_id == v0, 21);
        0x2::table::remove<vector<u8>, bool>(&mut arg2.likes, create_interaction_key(v0, 0x2::tx_context::sender(arg3)));
        0x95593861a7d92b0a9470e02aab1e4a1cda6646e5fd84ef66c37045fe54e446f7::suits::decrement_like_count(arg0);
        let Like {
            id         : v1,
            suit_id    : _,
            liker      : _,
            created_at : _,
        } = arg1;
        0x2::object::delete(v1);
    }
    
    public fun unretweet_suit(arg0: &mut 0x95593861a7d92b0a9470e02aab1e4a1cda6646e5fd84ef66c37045fe54e446f7::suits::Suit, arg1: Retweet, arg2: &mut InteractionRegistry, arg3: &mut 0x2::tx_context::TxContext) {
        let v0 = 0x2::object::id<0x95593861a7d92b0a9470e02aab1e4a1cda6646e5fd84ef66c37045fe54e446f7::suits::Suit>(arg0);
        assert!(arg1.original_suit_id == v0, 23);
        0x2::table::remove<vector<u8>, bool>(&mut arg2.retweets, create_interaction_key(v0, 0x2::tx_context::sender(arg3)));
        0x95593861a7d92b0a9470e02aab1e4a1cda6646e5fd84ef66c37045fe54e446f7::suits::decrement_retweet_count(arg0);
        let Retweet {
            id               : v1,
            original_suit_id : _,
            retweeter        : _,
            created_at       : _,
        } = arg1;
        0x2::object::delete(v1);
    }
    
    // decompiled from Move bytecode v6
}



<!-- ================== Messaging =================== -->

module 0x95593861a7d92b0a9470e02aab1e4a1cda6646e5fd84ef66c37045fe54e446f7::messaging {
    struct Message has store {
        sender: address,
        encrypted_message: vector<u8>,
        content_hash: vector<u8>,
        sent_timestamp: u64,
        is_read: bool,
    }
    
    struct Chat has store, key {
        id: 0x2::object::UID,
        participant_1: address,
        participant_2: address,
        messages: vector<Message>,
        created_at: u64,
    }
    
    struct ChatCreated has copy, drop {
        chat_id: 0x2::object::ID,
        participant_1: address,
        participant_2: address,
        timestamp: u64,
    }
    
    struct MessageSent has copy, drop {
        chat_id: 0x2::object::ID,
        sender: address,
        receiver: address,
        message_index: u64,
        timestamp: u64,
    }
    
    struct MessageRead has copy, drop {
        chat_id: 0x2::object::ID,
        message_index: u64,
        reader: address,
        original_sender: address,
        timestamp: u64,
    }
    
    struct ChatRegistry has key {
        id: 0x2::object::UID,
        chats: 0x2::table::Table<vector<u8>, 0x2::object::ID>,
    }
    
    public fun chat_created_at(arg0: &Chat) : u64 {
        arg0.created_at
    }
    
    public fun chat_participant_1(arg0: &Chat) : address {
        arg0.participant_1
    }
    
    public fun chat_participant_2(arg0: &Chat) : address {
        arg0.participant_2
    }
    
    fun compare_bytes(arg0: &vector<u8>, arg1: &vector<u8>) : bool {
        let v0 = 0x1::vector::length<u8>(arg0);
        let v1 = 0x1::vector::length<u8>(arg1);
        let v2 = if (v0 < v1) {
            v0
        } else {
            v1
        };
        let v3 = 0;
        while (v3 < v2) {
            let v4 = *0x1::vector::borrow<u8>(arg0, v3);
            let v5 = *0x1::vector::borrow<u8>(arg1, v3);
            if (v4 < v5) {
                return true
            };
            if (v4 > v5) {
                return false
            };
            v3 = v3 + 1;
        };
        v0 < v1
    }
    
    fun create_chat_key(arg0: address, arg1: address) : vector<u8> {
        let v0 = 0x1::vector::empty<u8>();
        let v1 = 0x1::bcs::to_bytes<address>(&arg0);
        let v2 = 0x1::bcs::to_bytes<address>(&arg1);
        let (v3, v4) = if (compare_bytes(&v1, &v2)) {
            (arg0, arg1)
        } else {
            (arg1, arg0)
        };
        let v5 = v4;
        let v6 = v3;
        0x1::vector::append<u8>(&mut v0, 0x1::bcs::to_bytes<address>(&v6));
        0x1::vector::append<u8>(&mut v0, 0x1::bcs::to_bytes<address>(&v5));
        v0
    }
    
    public fun get_conversation_messages(arg0: &Chat) : &vector<Message> {
        &arg0.messages
    }
    
    public fun get_unread_count(arg0: &Chat, arg1: address) : u64 {
        let v0 = 0;
        let v1 = 0;
        while (v1 < 0x1::vector::length<Message>(&arg0.messages)) {
            let v2 = 0x1::vector::borrow<Message>(&arg0.messages, v1);
            if (v2.sender != arg1 && !v2.is_read) {
                v0 = v0 + 1;
            };
            v1 = v1 + 1;
        };
        v0
    }
    
    fun init(arg0: &mut 0x2::tx_context::TxContext) {
        let v0 = ChatRegistry{
            id    : 0x2::object::new(arg0), 
            chats : 0x2::table::new<vector<u8>, 0x2::object::ID>(arg0),
        };
        0x2::transfer::share_object<ChatRegistry>(v0);
    }
    
    fun is_participant(arg0: &Chat, arg1: address) : bool {
        arg1 == arg0.participant_1 || arg1 == arg0.participant_2
    }
    
    public fun mark_as_read(arg0: &mut Chat, arg1: u64, arg2: &0x2::clock::Clock, arg3: &mut 0x2::tx_context::TxContext) {
        let v0 = 0x2::tx_context::sender(arg3);
        assert!(is_participant(arg0, v0), 40);
        assert!(arg1 < 0x1::vector::length<Message>(&arg0.messages), 41);
        let v1 = 0x1::vector::borrow_mut<Message>(&mut arg0.messages, arg1);
        assert!(v0 != v1.sender, 40);
        assert!(!v1.is_read, 43);
        v1.is_read = true;
        let v2 = MessageRead{
            chat_id         : 0x2::object::uid_to_inner(&arg0.id), 
            message_index   : arg1, 
            reader          : v0, 
            original_sender : v1.sender, 
            timestamp       : 0x2::clock::timestamp_ms(arg2),
        };
        0x2::event::emit<MessageRead>(v2);
    }
    
    public fun message_content_hash(arg0: &Message) : &vector<u8> {
        &arg0.content_hash
    }
    
    public fun message_encrypted_content(arg0: &Message) : &vector<u8> {
        &arg0.encrypted_message
    }
    
    public fun message_is_read(arg0: &Message) : bool {
        arg0.is_read
    }
    
    public fun message_sender(arg0: &Message) : address {
        arg0.sender
    }
    
    public fun message_timestamp(arg0: &Message) : u64 {
        arg0.sent_timestamp
    }
    
    public fun send_message(arg0: &mut Chat, arg1: vector<u8>, arg2: vector<u8>, arg3: &0x2::clock::Clock, arg4: &mut 0x2::tx_context::TxContext) {
        let v0 = 0x2::tx_context::sender(arg4);
        assert!(is_participant(arg0, v0), 40);
        assert!(!0x1::vector::is_empty<u8>(&arg1), 44);
        let v1 = 0x2::clock::timestamp_ms(arg3);
        let v2 = Message{
            sender            : v0, 
            encrypted_message : arg1, 
            content_hash      : arg2, 
            sent_timestamp    : v1, 
            is_read           : false,
        };
        0x1::vector::push_back<Message>(&mut arg0.messages, v2);
        let v3 = if (v0 == arg0.participant_1) {
            arg0.participant_2
        } else {
            arg0.participant_1
        };
        let v4 = MessageSent{
            chat_id       : 0x2::object::uid_to_inner(&arg0.id), 
            sender        : v0, 
            receiver      : v3, 
            message_index : 0x1::vector::length<Message>(&arg0.messages) - 1, 
            timestamp     : v1,
        };
        0x2::event::emit<MessageSent>(v4);
    }
    
    public fun start_chat(arg0: address, arg1: &mut ChatRegistry, arg2: &0x2::clock::Clock, arg3: &mut 0x2::tx_context::TxContext) {
        let v0 = 0x2::tx_context::sender(arg3);
        assert!(v0 != arg0, 42);
        let v1 = create_chat_key(v0, arg0);
        if (0x2::table::contains<vector<u8>, 0x2::object::ID>(&arg1.chats, v1)) {
            return
        };
        let v2 = 0x1::bcs::to_bytes<address>(&v0);
        let v3 = 0x1::bcs::to_bytes<address>(&arg0);
        let (v4, v5) = if (compare_bytes(&v2, &v3)) {
            (v0, arg0)
        } else {
            (arg0, v0)
        };
        let v6 = 0x2::clock::timestamp_ms(arg2);
        let v7 = Chat{
            id            : 0x2::object::new(arg3), 
            participant_1 : v4, 
            participant_2 : v5, 
            messages      : 0x1::vector::empty<Message>(), 
            created_at    : v6,
        };
        let v8 = 0x2::object::uid_to_inner(&v7.id);
        0x2::table::add<vector<u8>, 0x2::object::ID>(&mut arg1.chats, v1, v8);
        let v9 = ChatCreated{
            chat_id       : v8, 
            participant_1 : v4, 
            participant_2 : v5, 
            timestamp     : v6,
        };
        0x2::event::emit<ChatCreated>(v9);
        0x2::transfer::share_object<Chat>(v7);
    }
    
    // decompiled from Move bytecode v6
}



<!-- ===================== Profile ======================== -->

module 0x95593861a7d92b0a9470e02aab1e4a1cda6646e5fd84ef66c37045fe54e446f7::profile {
    struct Profile has store, key {
        id: 0x2::object::UID,
        owner: address,
        username: 0x1::string::String,
        bio: 0x1::string::String,
        pfp_url: 0x1::string::String,
        created_at: u64,
        followers_count: u64,
        following_count: u64,
    }
    
    struct UsernameRegistry has key {
        id: 0x2::object::UID,
        usernames: 0x2::table::Table<0x1::string::String, address>,
    }
    
    struct ProfileCreated has copy, drop {
        profile_id: 0x2::object::ID,
        owner: address,
        username: 0x1::string::String,
        timestamp: u64,
    }
    
    struct ProfileUpdated has copy, drop {
        profile_id: 0x2::object::ID,
        owner: address,
        timestamp: u64,
    }
    
    public fun check_username_available(arg0: &UsernameRegistry, arg1: vector<u8>) : bool {
        !0x2::table::contains<0x1::string::String, address>(&arg0.usernames, 0x1::string::utf8(arg1))
    }
    
    public fun create_profile(arg0: &mut UsernameRegistry, arg1: vector<u8>, arg2: vector<u8>, arg3: vector<u8>, arg4: &mut 0x2::tx_context::TxContext) : Profile {
        let v0 = 0x2::tx_context::sender(arg4);
        let v1 = 0x1::string::utf8(arg1);
        let v2 = 0x1::string::length(&v1);
        assert!(v2 >= 3 && v2 <= 20, 3);
        assert!(!0x2::table::contains<0x1::string::String, address>(&arg0.usernames, v1), 2);
        let v3 = Profile{
            id              : 0x2::object::new(arg4), 
            owner           : v0, 
            username        : v1, 
            bio             : 0x1::string::utf8(arg2), 
            pfp_url         : 0x1::string::utf8(arg3), 
            created_at      : 0, 
            followers_count : 0, 
            following_count : 0,
        };
        0x2::table::add<0x1::string::String, address>(&mut arg0.usernames, v3.username, v0);
        let v4 = ProfileCreated{
            profile_id : 0x2::object::id<Profile>(&v3), 
            owner      : v0, 
            username   : v3.username, 
            timestamp  : 0,
        };
        0x2::event::emit<ProfileCreated>(v4);
        v3
    }
    
    public fun get_bio(arg0: &Profile) : 0x1::string::String {
        arg0.bio
    }
    
    public fun get_created_at(arg0: &Profile) : u64 {
        arg0.created_at
    }
    
    public fun get_followers_count(arg0: &Profile) : u64 {
        arg0.followers_count
    }
    
    public fun get_following_count(arg0: &Profile) : u64 {
        arg0.following_count
    }
    
    public fun get_owner(arg0: &Profile) : address {
        arg0.owner
    }
    
    public fun get_pfp_url(arg0: &Profile) : 0x1::string::String {
        arg0.pfp_url
    }
    
    public fun get_profile_owner_by_username(arg0: &UsernameRegistry, arg1: vector<u8>) : address {
        let v0 = 0x1::string::utf8(arg1);
        assert!(0x2::table::contains<0x1::string::String, address>(&arg0.usernames, v0), 4);
        *0x2::table::borrow<0x1::string::String, address>(&arg0.usernames, v0)
    }
    
    public fun get_username(arg0: &Profile) : 0x1::string::String {
        arg0.username
    }
    
    fun init(arg0: &mut 0x2::tx_context::TxContext) {
        let v0 = UsernameRegistry{
            id        : 0x2::object::new(arg0), 
            usernames : 0x2::table::new<0x1::string::String, address>(arg0),
        };
        0x2::transfer::share_object<UsernameRegistry>(v0);
    }
    
    public fun update_profile(arg0: &mut Profile, arg1: &mut UsernameRegistry, arg2: vector<u8>, arg3: vector<u8>, arg4: vector<u8>, arg5: &mut 0x2::tx_context::TxContext) {
        let v0 = 0x2::tx_context::sender(arg5);
        assert!(arg0.owner == v0, 1);
        let v1 = 0x1::string::utf8(arg2);
        if (v1 != arg0.username) {
            let v2 = 0x1::string::length(&v1);
            assert!(v2 >= 3 && v2 <= 20, 3);
            assert!(!0x2::table::contains<0x1::string::String, address>(&arg1.usernames, v1), 2);
            0x2::table::remove<0x1::string::String, address>(&mut arg1.usernames, arg0.username);
            0x2::table::add<0x1::string::String, address>(&mut arg1.usernames, v1, v0);
            arg0.username = v1;
        };
        arg0.bio = 0x1::string::utf8(arg3);
        arg0.pfp_url = 0x1::string::utf8(arg4);
        let v3 = ProfileUpdated{
            profile_id : 0x2::object::id<Profile>(arg0), 
            owner      : arg0.owner, 
            timestamp  : 0,
        };
        0x2::event::emit<ProfileUpdated>(v3);
    }
    
    // decompiled from Move bytecode v6
}

<!-- ====================== SUIT===================== -->

module 0x95593861a7d92b0a9470e02aab1e4a1cda6646e5fd84ef66c37045fe54e446f7::suits {
    struct Suit has store, key {
        id: 0x2::object::UID,
        creator: address,
        content: 0x1::string::String,
        media_urls: vector<0x1::string::String>,
        created_at: u64,
        like_count: u64,
        comment_count: u64,
        retweet_count: u64,
        tip_total: u64,
    }
    
    struct SuitRegistry has key {
        id: 0x2::object::UID,
        suits: 0x2::table::Table<0x2::object::ID, address>,
        suit_ids: vector<0x2::object::ID>,
    }
    
    struct SuitCreated has copy, drop {
        suit_id: 0x2::object::ID,
        creator: address,
        content_preview: 0x1::string::String,
        timestamp: u64,
    }
    
    public fun add_tip_amount(arg0: &mut Suit, arg1: u64) {
        arg0.tip_total = arg0.tip_total + arg1;
    }
    
    public fun create_suit(arg0: &mut SuitRegistry, arg1: vector<u8>, arg2: vector<vector<u8>>, arg3: &0x2::clock::Clock, arg4: &mut 0x2::tx_context::TxContext) {
        let v0 = 0x2::tx_context::sender(arg4);
        let v1 = 0x1::string::utf8(arg1);
        let v2 = 0x1::string::length(&v1);
        assert!(v2 > 0, 10);
        assert!(v2 <= 280, 11);
        let v3 = 0x1::vector::empty<0x1::string::String>();
        let v4 = 0;
        while (v4 < 0x1::vector::length<vector<u8>>(&arg2)) {
            0x1::vector::push_back<0x1::string::String>(&mut v3, 0x1::string::utf8(*0x1::vector::borrow<vector<u8>>(&arg2, v4)));
            v4 = v4 + 1;
        };
        let v5 = 0x2::clock::timestamp_ms(arg3);
        let v6 = Suit{
            id            : 0x2::object::new(arg4), 
            creator       : v0, 
            content       : v1, 
            media_urls    : v3, 
            created_at    : v5, 
            like_count    : 0, 
            comment_count : 0, 
            retweet_count : 0, 
            tip_total     : 0,
        };
        let v7 = 0x2::object::id<Suit>(&v6);
        0x2::table::add<0x2::object::ID, address>(&mut arg0.suits, v7, v0);
        0x1::vector::push_back<0x2::object::ID>(&mut arg0.suit_ids, v7);
        let v8 = if (v2 > 100) {
            0x1::string::substring(&v1, 0, 100)
        } else {
            v1
        };
        let v9 = SuitCreated{
            suit_id         : v7, 
            creator         : v0, 
            content_preview : v8, 
            timestamp       : v5,
        };
        0x2::event::emit<SuitCreated>(v9);
        0x2::transfer::share_object<Suit>(v6);
    }
    
    public fun decrement_like_count(arg0: &mut Suit) {
        if (arg0.like_count > 0) {
            arg0.like_count = arg0.like_count - 1;
        };
    }
    
    public fun decrement_retweet_count(arg0: &mut Suit) {
        if (arg0.retweet_count > 0) {
            arg0.retweet_count = arg0.retweet_count - 1;
        };
    }
    
    public fun get_comment_count(arg0: &Suit) : u64 {
        arg0.comment_count
    }
    
    public fun get_content(arg0: &Suit) : 0x1::string::String {
        arg0.content
    }
    
    public fun get_created_at(arg0: &Suit) : u64 {
        arg0.created_at
    }
    
    public fun get_creator(arg0: &Suit) : address {
        arg0.creator
    }
    
    public fun get_like_count(arg0: &Suit) : u64 {
        arg0.like_count
    }
    
    public fun get_media_urls(arg0: &Suit) : vector<0x1::string::String> {
        arg0.media_urls
    }
    
    public fun get_recent_suits(arg0: &SuitRegistry, arg1: u64, arg2: u64) : vector<0x2::object::ID> {
        let v0 = 0x1::vector::empty<0x2::object::ID>();
        let v1 = 0x1::vector::length<0x2::object::ID>(&arg0.suit_ids);
        if (arg2 >= v1) {
            return v0
        };
        let v2 = v1 - arg2 - 1;
        let v3 = 0;
        while (v3 < arg1 && v2 >= 0) {
            0x1::vector::push_back<0x2::object::ID>(&mut v0, *0x1::vector::borrow<0x2::object::ID>(&arg0.suit_ids, v2));
            v3 = v3 + 1;
            if (v2 == 0) {
                break
            };
            v2 = v2 - 1;
        };
        v0
    }
    
    public fun get_retweet_count(arg0: &Suit) : u64 {
        arg0.retweet_count
    }
    
    public fun get_suits_by_creator(arg0: &SuitRegistry, arg1: address) : vector<0x2::object::ID> {
        let v0 = 0x1::vector::empty<0x2::object::ID>();
        let v1 = 0;
        while (v1 < 0x1::vector::length<0x2::object::ID>(&arg0.suit_ids)) {
            let v2 = *0x1::vector::borrow<0x2::object::ID>(&arg0.suit_ids, v1);
            if (*0x2::table::borrow<0x2::object::ID, address>(&arg0.suits, v2) == arg1) {
                0x1::vector::push_back<0x2::object::ID>(&mut v0, v2);
            };
            v1 = v1 + 1;
        };
        v0
    }
    
    public fun get_tip_total(arg0: &Suit) : u64 {
        arg0.tip_total
    }
    
    public fun increment_comment_count(arg0: &mut Suit) {
        arg0.comment_count = arg0.comment_count + 1;
    }
    
    public fun increment_like_count(arg0: &mut Suit) {
        arg0.like_count = arg0.like_count + 1;
    }
    
    public fun increment_retweet_count(arg0: &mut Suit) {
        arg0.retweet_count = arg0.retweet_count + 1;
    }
    
    fun init(arg0: &mut 0x2::tx_context::TxContext) {
        let v0 = SuitRegistry{
            id       : 0x2::object::new(arg0), 
            suits    : 0x2::table::new<0x2::object::ID, address>(arg0), 
            suit_ids : 0x1::vector::empty<0x2::object::ID>(),
        };
        0x2::transfer::share_object<SuitRegistry>(v0);
    }
    
    // decompiled from Move bytecode v6
}


<!-- ================== Tipping ============ -->
module 0x95593861a7d92b0a9470e02aab1e4a1cda6646e5fd84ef66c37045fe54e446f7::tipping {
    struct TipBalance has key {
        id: 0x2::object::UID,
        owner: address,
        balance: 0x2::balance::Balance<0x2::sui::SUI>,
        total_received: u64,
        total_withdrawn: u64,
    }
    
    struct TipBalanceRegistry has key {
        id: 0x2::object::UID,
        balances: 0x2::table::Table<address, 0x2::object::ID>,
    }
    
    struct TipSent has copy, drop {
        suit_id: 0x2::object::ID,
        tipper: address,
        recipient: address,
        amount: u64,
        timestamp: u64,
    }
    
    struct FundsWithdrawn has copy, drop {
        owner: address,
        amount: u64,
        timestamp: u64,
    }
    
    public fun create_tip_balance(arg0: &mut TipBalanceRegistry, arg1: &mut 0x2::tx_context::TxContext) : 0x2::object::ID {
        get_or_create_tip_balance(arg0, 0x2::tx_context::sender(arg1), arg1)
    }
    
    public fun get_balance(arg0: &TipBalance) : u64 {
        0x2::balance::value<0x2::sui::SUI>(&arg0.balance)
    }
    
    fun get_or_create_tip_balance(arg0: &mut TipBalanceRegistry, arg1: address, arg2: &mut 0x2::tx_context::TxContext) : 0x2::object::ID {
        if (0x2::table::contains<address, 0x2::object::ID>(&arg0.balances, arg1)) {
            *0x2::table::borrow<address, 0x2::object::ID>(&arg0.balances, arg1)
        } else {
            let v1 = TipBalance{
                id              : 0x2::object::new(arg2), 
                owner           : arg1, 
                balance         : 0x2::balance::zero<0x2::sui::SUI>(), 
                total_received  : 0, 
                total_withdrawn : 0,
            };
            let v2 = 0x2::object::id<TipBalance>(&v1);
            0x2::table::add<address, 0x2::object::ID>(&mut arg0.balances, arg1, v2);
            0x2::transfer::share_object<TipBalance>(v1);
            v2
        }
    }
    
    public fun get_owner(arg0: &TipBalance) : address {
        arg0.owner
    }
    
    public fun get_total_received(arg0: &TipBalance) : u64 {
        arg0.total_received
    }
    
    public fun get_total_withdrawn(arg0: &TipBalance) : u64 {
        arg0.total_withdrawn
    }
    
    fun init(arg0: &mut 0x2::tx_context::TxContext) {
        let v0 = TipBalanceRegistry{
            id       : 0x2::object::new(arg0), 
            balances : 0x2::table::new<address, 0x2::object::ID>(arg0),
        };
        0x2::transfer::share_object<TipBalanceRegistry>(v0);
    }
    
    public fun tip_suit(arg0: &mut 0x95593861a7d92b0a9470e02aab1e4a1cda6646e5fd84ef66c37045fe54e446f7::suits::Suit, arg1: &mut TipBalance, arg2: 0x2::coin::Coin<0x2::sui::SUI>, arg3: &0x2::clock::Clock, arg4: &mut 0x2::tx_context::TxContext) {
        let v0 = 0x2::tx_context::sender(arg4);
        let v1 = 0x95593861a7d92b0a9470e02aab1e4a1cda6646e5fd84ef66c37045fe54e446f7::suits::get_creator(arg0);
        let v2 = 0x2::coin::value<0x2::sui::SUI>(&arg2);
        assert!(v2 >= 10000000, 31);
        assert!(v0 != v1, 32);
        assert!(arg1.owner == v1, 31);
        0x2::balance::join<0x2::sui::SUI>(&mut arg1.balance, 0x2::coin::into_balance<0x2::sui::SUI>(arg2));
        arg1.total_received = arg1.total_received + v2;
        0x95593861a7d92b0a9470e02aab1e4a1cda6646e5fd84ef66c37045fe54e446f7::suits::add_tip_amount(arg0, v2);
        let v3 = TipSent{
            suit_id   : 0x2::object::id<0x95593861a7d92b0a9470e02aab1e4a1cda6646e5fd84ef66c37045fe54e446f7::suits::Suit>(arg0), 
            tipper    : v0, 
            recipient : v1, 
            amount    : v2, 
            timestamp : 0x2::clock::timestamp_ms(arg3),
        };
        0x2::event::emit<TipSent>(v3);
    }
    
    public fun withdraw_funds(arg0: &mut TipBalance, arg1: u64, arg2: &0x2::clock::Clock, arg3: &mut 0x2::tx_context::TxContext) {
        let v0 = 0x2::tx_context::sender(arg3);
        assert!(arg0.owner == v0, 33);
        let v1 = 0x2::balance::value<0x2::sui::SUI>(&arg0.balance);
        assert!(v1 > 0, 34);
        assert!(arg1 <= v1, 30);
        arg0.total_withdrawn = arg0.total_withdrawn + arg1;
        let v2 = FundsWithdrawn{
            owner     : v0, 
            amount    : arg1, 
            timestamp : 0x2::clock::timestamp_ms(arg2),
        };
        0x2::event::emit<FundsWithdrawn>(v2);
        0x2::transfer::public_transfer<0x2::coin::Coin<0x2::sui::SUI>>(0x2::coin::from_balance<0x2::sui::SUI>(0x2::balance::split<0x2::sui::SUI>(&mut arg0.balance, arg1), arg3), v0);
    }
    
    // decompiled from Move bytecode v6
}

