module suits::messaging;

use sui::clock::{Self, Clock};
use sui::event;

const E_NOT_PARTICIPANT: u64 = 1;
const E_NOT_ALLOWED: u64 = 2;

// create high Level objects and Event object
public struct Message has store {
    sender: address,
    encrypted_message: vector<u64>,
    content_hash: vector<u64>,
    sent_timestamp: u64,
    is_read: bool,
}

public struct Chat has key, store {
    id: UID,
    sender: address,
    receiver: address,
    messages: vector<Message>,
}

public struct ChatCreated has copy, drop {
    chat_id: ID,
    sender: address,
    receiver: address,
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

//  Create smart contract functions

public fun start_chart(receiver: address, clock: &Clock, ctx: &mut TxContext) {
    let sender = tx_context::sender(ctx);
    let chat = Chat {
        id: object::new(ctx),
        sender,
        receiver,
        messages: vector::empty(),
    };

    let chat_id = object::uid_to_inner(&chat.id);

    event::emit(ChatCreated {
        chat_id,
        sender,
        receiver,
        timestamp: clock::timestamp_ms(clock),
    });

    transfer::share_object(chat);
}

public fun send_message(
    chat: &mut Chat,
    encrypted_message: vector<u64>,
    content_hash: vector<u64>,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    let sender = tx_context::sender(ctx);
    assert!(sender == chat.sender || sender == chat.receiver, E_NOT_PARTICIPANT);

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

    let receiver = if (sender == chat.sender) { chat.receiver } else { chat.sender };

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
    ctx: &mut TxContext,
) {
    let sender = tx_context::sender(ctx);
    assert!(sender == chat.sender || sender == chat.receiver, E_NOT_PARTICIPANT);

    let message = vector::borrow_mut(&mut chat.messages, message_index);
    assert!(sender != message.sender, E_NOT_ALLOWED);

    let original_sender = message.sender;
    message.is_read = true;

    event::emit(MessageRead {
        chat_id: object::uid_to_inner(&chat.id),
        message_index,
        reader: sender,
        original_sender,
        timestamp: clock::timestamp_ms(clock),
    });
}

public fun get_conversation_messages(chat: &Chat): &vector<Message> { &chat.messages }

// Constructor for Message to allow safe use from friend modules
public fun new_message(
    sender: address,
    encrypted_message: vector<u64>,
    content_hash: vector<u64>,
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

// ===== Setting up access control function (messaging) =====
entry fun is_approve_chat(
    _id: vector<u8>,
    chat: &Chat,
    ctx: &TxContext,
) {
    let sender = tx_context::sender(ctx);
    assert!(sender == chat.sender || sender == chat.receiver, E_NOT_PARTICIPANT);
}

}
