# Error Constants Reference

This document lists all error constants defined across the Suitter smart contract modules.

## Profile Module (`suits::profile`)

| Error Code | Constant Name | Description |
|------------|---------------|-------------|
| 1 | `E_NOT_PROFILE_OWNER` | Caller is not the owner of the profile |
| 2 | `E_USERNAME_TAKEN` | Username is already taken by another user |
| 3 | `E_INVALID_USERNAME` | Username format is invalid (empty, too long, or contains invalid characters) |
| 4 | `E_PROFILE_NOT_FOUND` | Profile not found for the given address |

## Suits Module (`suits::suits`)

| Error Code | Constant Name | Description |
|------------|---------------|-------------|
| 10 | `E_EMPTY_CONTENT` | Content is empty or missing |
| 11 | `E_CONTENT_TOO_LONG` | Content exceeds maximum allowed length |
| 12 | `E_SUIT_NOT_FOUND` | Suit not found for the given ID |
| 13 | `E_NOT_SUIT_CREATOR` | Caller is not the creator of the Suit |

## Interactions Module (`suits::interactions`)

| Error Code | Constant Name | Description |
|------------|---------------|-------------|
| 20 | `E_ALREADY_LIKED` | User has already liked this Suit |
| 21 | `E_NOT_LIKED` | User has not liked this Suit |
| 22 | `E_ALREADY_RETWEETED` | User has already retweeted this Suit |
| 23 | `E_NOT_RETWEETED` | User has not retweeted this Suit |
| 24 | `E_CANNOT_LIKE_OWN_SUIT` | User cannot like their own Suit |
| 25 | `E_EMPTY_COMMENT` | Comment content is empty |

## Tipping Module (`suits::tipping`)

| Error Code | Constant Name | Description |
|------------|---------------|-------------|
| 30 | `E_INSUFFICIENT_BALANCE` | Insufficient balance for withdrawal |
| 31 | `E_INVALID_TIP_AMOUNT` | Tip amount is invalid (below minimum or zero) |
| 32 | `E_CANNOT_TIP_SELF` | User cannot tip their own content |
| 33 | `E_WITHDRAWAL_FAILED` | Withdrawal operation failed |

## Messaging Module (`suits::messaging`)

| Error Code | Constant Name | Description |
|------------|---------------|-------------|
| 40 | `E_NOT_PARTICIPANT` | Caller is not a participant in the chat |
| 41 | `E_INVALID_MESSAGE_INDEX` | Invalid message index provided |
| 42 | `E_CANNOT_MESSAGE_SELF` | User cannot message themselves |
| 43 | `E_MESSAGE_ALREADY_READ` | Message is already marked as read |

## Error Code Ranges

- **1-9**: Profile module errors
- **10-19**: Suits module errors
- **20-29**: Interactions module errors
- **30-39**: Tipping module errors
- **40-49**: Messaging module errors

This organization ensures no error code conflicts between modules and provides clear categorization.
