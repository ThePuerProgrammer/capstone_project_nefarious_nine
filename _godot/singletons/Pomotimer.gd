extends Node

onready var _time_limit = 100


onready var _game_queue_timer
var currentGame
var current_game_scene
var _game_queue
var _deck

func _ready():
	#_game_queue_timer = Timer.new()
	#add_child(_game_queue_timer)
	#_game_queue_timer.connect("timeout",self,"_on_Timer_timeout")
	pass


func start_game(time_limit, game_queue, deck):
	if game_queue.empty()==true:
		print("Empty after pop")
		end_of_queue()
	new_game_queue(game_queue)
	_deck = deck
	_time_limit = time_limit
	#DECLARE THESE
	#print("\nTime_Limit:",_time_limit)
	print("Deck:", _deck)
	print("GameQueue:",_game_queue)

	print("PomoDICK:",deck)
	#get_tree().change_scene(game_queue[0])
	print("GAMEQUEUE:",_game_queue[0])
	currentGame = _game_queue[0]
	current_game_scene = check_currentGame_Scene(currentGame)
	_game_queue.pop_front()
	get_tree().change_scene(current_game_scene)
	if game_queue.empty()==true:
		print("Empty after pop")
		#end_of_queue()
	else:
		print("AFTERPOP:",game_queue[0])

func _on_Timer_timeout(time_limit, game_queue, deck):
	print("TIMEOUT QUEUE:", time_limit)
	print("TIMEOUT QUEUE:",game_queue)
	if game_queue.empty()==true:
		_game_queue_timer.stop()
		end_of_queue()
	#get_tree().change_scene(game_queue[0])
	game_queue.pop_front()
	start_game(time_limit,game_queue,deck)
	
#Takes the current game from the game queue and returns the scene
func check_currentGame_Scene(currentGame):
	match currentGame:
		"Dungeon Fight":
			return ("res://transitions/dungeonfight_transition.tscn")
		"Pomoblast":
			return ("res://transitions/pomoblast_transition.tscn")
		"PomoBITE":
			return ("res://transitions/pomobite_transition.tscn")
		"Slowfruit":
			return ("res://transitions/slowfruit_transition.tscn")

func new_game_queue(game_queue):
	Pomotimer._game_queue = game_queue
func end_of_queue():
	get_tree().change_scene("res://Menu/SingleplayerOptionScreen.tscn")
