# This class file was taken from the following open source project (MIT License)
# https://github.com/henriquelalves/SnakeVersusWebRTC/blob/main/godot-project/MultiplayerFramework/Message.gd

class_name Message

const SERVER_LOGIN = 1
const GAME_START = 2
const IS_ECHO = 4
const START_POMOBITE = 8

const _BYTE_MASK = 255

var server_login : bool
var game_start : bool
var is_echo : bool
var start_pomobite : bool

var content

func get_raw() -> PoolByteArray:
	var message = PoolByteArray()
	
	var byte = 0
	byte = set_bit(byte, SERVER_LOGIN, server_login)
	byte = set_bit(byte, IS_ECHO, is_echo)
	byte = set_bit(byte, GAME_START, game_start)
	byte = set_bit(byte, START_POMOBITE, start_pomobite)
	
	message.append(byte)
	message.append_array(var2bytes(content))
	
	return message

func from_raw(var arr : PoolByteArray):
	var flags = arr[0]
	
	server_login 	= get_bit(flags, SERVER_LOGIN)
	is_echo 		= get_bit(flags, IS_ECHO)
	game_start 		= get_bit(flags, GAME_START)
	start_pomobite 	= get_bit(flags, START_POMOBITE)
	
	content = null
	if (arr.size() > 1):
		content = bytes2var(arr.subarray(1, -1))

static func get_bit(var byte : int, var flag : int) -> bool:
	return byte & flag == flag

static func set_bit(var byte : int, var flag : int, var is_set : bool = true) -> int:
	if is_set:
		return byte | flag
	else:
		return byte & ~flag
