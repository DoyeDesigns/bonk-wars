export const idl = {
    "version": "0.1.0",
    "name": "dice_project",
    "instructions": [
      {
        "name": "initialize",
        "docs": [
          "Initialize a new game"
        ],
        "accounts": [
          {
            "name": "game",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "initializer",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "systemProgram",
            "isMut": false,
            "isSigner": false
          }
        ],
        "args": [
          {
            "name": "betAmount",
            "type": "u64"
          },
          {
            "name": "platformFee",
            "type": "u8"
          }
        ]
      },
      {
        "name": "submitGameResult",
        "docs": [
          "Submit game results and distribute tokens"
        ],
        "accounts": [
          {
            "name": "game",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "player1",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "player2",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "player1Token",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "player2Token",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "gameToken",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "platformToken",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "tokenProgram",
            "isMut": false,
            "isSigner": false
          }
        ],
        "args": [
          {
            "name": "winner",
            "type": "publicKey"
          }
        ]
      }
    ],
    "accounts": [
      {
        "name": "Game",
        "docs": [
          "Game account structure"
        ],
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "betAmount",
              "type": "u64"
            },
            {
              "name": "platformFee",
              "type": "u8"
            },
            {
              "name": "pot",
              "type": "u64"
            },
            {
              "name": "winner",
              "type": {
                "option": "publicKey"
              }
            },
            {
              "name": "potAddress",
              "type": "publicKey"
            },
            {
              "name": "state",
              "type": {
                "defined": "GameState"
              }
            }
          ]
        }
      }
    ],
    "types": [
      {
        "name": "GameState",
        "type": {
          "kind": "enum",
          "variants": [
            {
              "name": "Open"
            },
            {
              "name": "Closed"
            }
          ]
        }
      }
    ],
    "errors": [
      {
        "code": 6000,
        "name": "InvalidWinner",
        "msg": "The submitted winner is not a valid player."
      },
      {
        "code": 6001,
        "name": "InvalidGamePot",
        "msg": "The game pot address is invalid."
      },
      {
        "code": 6002,
        "name": "InsufficientFunds",
        "msg": "Insufficient funds for bet."
      },
      {
        "code": 6003,
        "name": "GameNotOpen",
        "msg": "Game is not in an open state."
      }
    ],
    "metadata": {
      "address": "Bzkq6FvQyBwWR1MAoFoyCYCQsYNbu2UrahYCz1cLRMEk"
    }
  }