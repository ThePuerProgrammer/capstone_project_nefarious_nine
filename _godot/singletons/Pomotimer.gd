extends Node
#Global Variables
################################################################################
var timer
var currentGame
var current_game_scene
var _game_queue
var _deck
var _time_limit
var _testing_count
################################################################################

#Creation of Timer/Adding to Tree/Connecting Signal
################################################################################
func _ready():
	timer= Timer.new()
	add_child(timer)
	timer.connect("timeout",self,"_on_Timer_timeout")
################################################################################
#Starts the Game
################################################################################
func start_game(time_limit, game_queue, deck):
	#Checks if the queue is empty, if so return to menu else it will continue the queue
	if game_queue.empty()==true:
		print("Empty after pop")
		get_tree().change_scene("res://Menu/SingleplayerOptionScreen.tscn")
	else:
		#Sets Timer time limit and then initiates the game
		timer_start(time_limit)
		#Updates the Queue
		new_game_queue(game_queue)
		#Declaring variables being passed from games and singleplayer menu to a local ones
		_deck = deck
		_time_limit = time_limit
		#Retaining the game before popping off the queue before transition
		currentGame = _game_queue[0]
		current_game_scene = check_currentGame_Scene(currentGame)
		_game_queue.pop_front()
		get_tree().change_scene(current_game_scene)
################################################################################
#Methods Used In Start Game
################################################################################
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
#Reassigns the game queue
func new_game_queue(game_queue):
	Pomotimer._game_queue = game_queue

# Method Connected to the signal of the Timer Timing Out
func _on_Timer_timeout():
	if _game_queue.empty()==true:
		timer.stop()
		get_tree().change_scene("res://Menu/SingleplayerOptionScreen.tscn")
	else:
		start_game(_time_limit,_game_queue,_deck)

#Sets Wait Time and Starts Timer
func timer_start(time_limit):
		timer.set_wait_time(time_limit)
		timer.start()
################################################################################
