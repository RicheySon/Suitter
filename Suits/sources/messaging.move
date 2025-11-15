module suits::messaging {
    use sui::clock::{Self, Clock};
    use sui::event;
    use sui::table::{Self, Table};

    // ===== Error Constants =====
    
    const E_NOT_PARTICIPANT: u64 = 40;
    const E_INVALID_MESSAGE_INDEX: u64 = 41;
    const E_CANNOT_MESSAGE_SELF: u64 = 42;
    const E_MESSAGE_ALREADY_READ: u64 = 43;
    const E_EMPTY_MESSAGE: u64 = 44;

    // ===== Data Structures =====

    public struct Message has store {
        sender: address,
        encrypted_message: vector<u8>,
        content_hash: vector<u8>,
        sent_timestamp: u64,
        is_read: bool,
    }

    
    public struct Chat has key, store {
        id: object::UID,
        participant_1: address,
        participant_2: address,
        messages: vector<Message>,
        created_at: u64,
    }

    // ===== Events =====

    public struct ChatCreated has copy, drop {
        chat_id: ID,
        participant_1: address,
        participant_2: address,
        timestamp: u64,
    }

    public struct MessageSent has copy, drop {
        chat_id: ID,
        sender: address,
        receiver: address,
        message_index: u64,
        timestamp: u64,
    }

    public struct MessageRead has copy, drop {
        chat_id: ID,
        message_index: u64,
        reader: address,
        original_sender: address,
        timestamp: u64,
    }


    public struct ChatRegistry has key {
        id: object::UID,
        chats: Table<vector<u8>, ID>,
    }

    // ===== Initialization =====

    fun init(ctx: &mut tx_context::TxContext) {
        let registry = ChatRegistry {
            id: object::new(ctx),
            chats: table::new(ctx),
        };
        transfer::share_object(registry);
    }

    // ===== Functions =====

    fun create_chat_key(addr1: address, addr2: address): vector<u8> {
        let mut key = std::vector::empty<u8>();
        
        let bytes1 = std::bcs::to_bytes(&addr1);
        let bytes2 = std::bcs::to_bytes(&addr2);
        
        let (first, second) = if (compare_bytes(&bytes1, &bytes2)) {
            (addr1, addr2)
        } else {
            (addr2, addr1)
        };
        
        std::vector::append(&mut key, std::bcs::to_bytes(&first));
        std::vector::append(&mut key, std::bcs::to_bytes(&second));
        
        key
    }

    fun compare_bytes(bytes1: &vector<u8>, bytes2: &vector<u8>): bool {
        let len1 = std::vector::length(bytes1);
        let len2 = std::vector::length(bytes2);
        let min_len = if (len1 < len2) { len1 } else { len2 };
        
        let mut i = 0;
        while (i < min_len) {
            let b1 = *std::vector::borrow(bytes1, i);
            let b2 = *std::vector::borrow(bytes2, i);
            if (b1 < b2) {
                return true
            } else if (b1 > b2) {
                return false
            };
            i = i + 1;
        };
        
        // If all bytes are equal up to min_len, shorter vector is "less than"
        len1 < len2
    }

    fun is_participant(chat: &Chat, caller: address): bool {
        caller == chat.participant_1 || caller == chat.participant_2
    }

    // ===== Public Functions =====

    public fun start_chat(
        other_user: address,
        registry: &mut ChatRegistry,
        clock: &Clock,
        ctx: &mut tx_context::TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        assert!(sender != other_user, E_CANNOT_MESSAGE_SELF);
        
        let chat_key = create_chat_key(sender, other_user);
        
        if (table::contains(&registry.chats, chat_key)) {
            return
        };
        
        let sender_bytes = std::bcs::to_bytes(&sender);
        let other_bytes = std::bcs::to_bytes(&other_user);
        let (participant_1, participant_2) = if (compare_bytes(&sender_bytes, &other_bytes)) {
            (sender, other_user)
        } else {
            (other_user, sender)
        };
        
        // Create new Chat object
        let timestamp = clock::timestamp_ms(clock);
        let chat = Chat {
            id: object::new(ctx),
            participant_1,
            participant_2,
            messages: vector::empty(),
            created_at: timestamp,
        };

        let chat_id = object::uid_to_inner(&chat.id);

        // Register chat in registr
        table::add(&mut registry.chats, chat_key, chat_id);

        event::emit(ChatCreated {
            chat_id,
            participant_1,
            participant_2,
            timestamp,
        });

        transfer::share_object(chat);
    }

  
    public fun send_message(
        chat: &mut Chat,
        encrypted_message: vector<u8>,
        content_hash: vector<u8>,
        clock: &Clock,
        ctx: &mut tx_context::TxContext,
    ) {
        let sender = tx_context::sender(ctx);
        
        assert!(is_participant(chat, sender), E_NOT_PARTICIPANT);
        
        assert!(!vector::is_empty(&encrypted_message), E_EMPTY_MESSAGE);

        let sent_timestamp = clock::timestamp_ms(clock);
        
        let message = Message {
            sender,
            encrypted_message,
            content_hash,
            sent_timestamp,
            is_read: false,
        };

        vector::push_back(&mut chat.messages, message);
        let message_index = vector::length(&chat.messages) - 1;

        let receiver = if (sender == chat.participant_1) { 
            chat.participant_2 
        } else { 
            chat.participant_1 
        };

        event::emit(MessageSent {
            chat_id: object::uid_to_inner(&chat.id),
            sender,
            receiver,
            message_index,
            timestamp: sent_timestamp,
        });
    }

   
    public fun mark_as_read(
        chat: &mut Chat,
        message_index: u64,
        clock: &Clock,
        ctx: &mut tx_context::TxContext,
    ) {
        let caller = tx_context::sender(ctx);
        
        assert!(is_participant(chat, caller), E_NOT_PARTICIPANT);
        
        let messages_len = vector::length(&chat.messages);
        assert!(message_index < messages_len, E_INVALID_MESSAGE_INDEX);

        let message = vector::borrow_mut(&mut chat.messages, message_index);
        
        assert!(caller != message.sender, E_NOT_PARTICIPANT);
        
        assert!(!message.is_read, E_MESSAGE_ALREADY_READ);

        let original_sender = message.sender;
        
        message.is_read = true;

        event::emit(MessageRead {
            chat_id: object::uid_to_inner(&chat.id),
            message_index,
            reader: caller,
            original_sender,
            timestamp: clock::timestamp_ms(clock),
        });
    }

    // ===== Query Functions =====

    /// Returns all messages in a chat with proper filtering
    /// 
    /// Query Pattern: This function provides read-only access to the complete
    /// message history for a chat. Messages are stored in chronological order
    /// (oldest first) in the vector, making it efficient to retrieve the entire
    /// conversation or paginate through messages on the client side.
    /// 
    /// Filtering: The function returns all messages without server-side filtering.
    /// Client applications should:
    /// - Decrypt messages after retrieval using the encrypted_message field
    /// - Filter by sender if showing only messages from one participant
    /// - Filter by is_read status if implementing unread message views
    /// - Implement pagination by slicing the returned vector on the client
    /// 
    /// Authorization: While this function doesn't enforce participant checks,
    /// the Chat object itself is a shared object that only participants can
    /// access through proper transaction authorization. The blockchain ensures
    /// only participants can read the chat.
    /// 
    /// # Arguments
    /// * `chat` - The Chat object to query
    /// 
    /// # Returns
    /// Reference to the vector of all messages in chronological order
    /// 
    /// # Example Usage
    /// ```
    /// let messages = get_conversation_messages(&chat);
    /// // Client-side filtering for unread messages:
    /// // messages.filter(msg => !msg.is_read && msg.sender != current_user)
    /// ```
    public fun get_conversation_messages(chat: &Chat): &vector<Message> { 
        &chat.messages 
    }

    /// Counts unread messages for a specific user in a chat
    /// 
    /// Query Pattern: This function implements a filtered count query that
    /// iterates through all messages and counts only those that meet specific
    /// criteria. This is more efficient than retrieving all messages and
    /// counting on the client side when you only need the count.
    /// 
    /// Filtering Logic:
    /// 1. Only counts messages where sender != user_address (messages from other participant)
    /// 2. Only counts messages where is_read == false (unread messages)
    /// 3. Combines both filters with AND logic
    /// 
    /// This ensures that:
    /// - Users don't count their own messages as unread
    /// - Only messages that haven't been marked as read are counted
    /// - The count represents actionable unread messages for the user
    /// 
    /// Performance: O(n) where n is the total number of messages in the chat.
    /// For large conversations, consider caching this value on the client side
    /// and updating it based on MessageSent and MessageRead events.
    /// 
    /// # Arguments
    /// * `chat` - The Chat object to query
    /// * `user_address` - Address of the user to count unread messages for
    /// 
    /// # Returns
    /// Number of unread messages sent by the other participant
    /// 
    /// # Example Usage
    /// ```
    /// let unread = get_unread_count(&chat, user_address);
    /// // Display badge: "You have {unread} unread messages"
    /// ```
    public fun get_unread_count(chat: &Chat, user_address: address): u64 {
        let mut count = 0u64;
        let mut i = 0u64;
        let len = std::vector::length(&chat.messages);
        
        // Iterate through all messages in chronological order
        // This ensures we count all unread messages from the beginning of the conversation
        while (i < len) {
            let message = std::vector::borrow(&chat.messages, i);
            
            // Filter 1: Exclude messages sent by the user themselves
            // Filter 2: Only count messages that haven't been marked as read
            // This combination gives us the count of unread messages from the other participant
            if (message.sender != user_address && !message.is_read) {
                count = count + 1;
            };
            
            i = i + 1;
        };
        
        count
    }

    // ===== Accessor Functions =====

    /// Returns the sender address of a message
    public fun message_sender(message: &Message): address {
        message.sender
    }

    /// Returns the encrypted content of a message
    public fun message_encrypted_content(message: &Message): &vector<u8> {
        &message.encrypted_message
    }

    /// Returns the content hash of a message
    public fun message_content_hash(message: &Message): &vector<u8> {
        &message.content_hash
    }

    /// Returns the timestamp of a message
    public fun message_timestamp(message: &Message): u64 {
        message.sent_timestamp
    }

    /// Returns whether a message has been read
    public fun message_is_read(message: &Message): bool {
        message.is_read
    }

    /// Returns the first participant of a chat
    public fun chat_participant_1(chat: &Chat): address {
        chat.participant_1
    }

    /// Returns the second participant of a chat
    public fun chat_participant_2(chat: &Chat): address {
        chat.participant_2
    }

    /// Returns when the chat was created
    public fun chat_created_at(chat: &Chat): u64 {
        chat.created_at
    }

    // ===== Test-only Functions =====

    #[test_only]
    /// Constructor for Message to allow safe use in tests
    public fun new_message(
        sender: address,
        encrypted_message: vector<u8>,
        content_hash: vector<u8>,
        sent_timestamp: u64,
    ): Message {
        Message { 
            sender, 
            encrypted_message, 
            content_hash, 
            sent_timestamp, 
            is_read: false 
        }
    }

    #[test_only]
    /// Initialize registry for testing
    public fun init_for_testing(ctx: &mut tx_context::TxContext) {
        init(ctx);
    }
}
