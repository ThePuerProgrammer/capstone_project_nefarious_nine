extends Node
#Global Variables
################################################################################

#Timer
##############
var timer
var _time_limit
var _testing_count
#Game Queue
##############
var currentGame
var current_game_scene
var _game_queue
#Deck of Cards
##############
var _deck
#Game Settings
##############
const SAVEFILE = "user:://SAVEFILE.save"
var _game_settings = {}


# structure of an element in _flashcards
#	_flashcards[DESIRED_INDEX]['question']
#	_flashcards[DESIRED_INDEX]['answer']
#	_flashcards[DESIRED_INDEX]['isMultipleChoice']
#	_flashcards[DESIRED_INDEX]['incorrectAnswers']
var _flashcards = []
var _possibleAnswerPool = []
var _fakeAnswerPool = [
	"poison", "rot", "smooth", "garrulous", "sparkling",
	"anxious", "perpetual", "intend", "railway", "thrill",
	"powerful", "hysterical", "store", "haunt", "used",
	"statuesque", "strap", "overt", "sour", "sign",
	"pickle", "well-made", "rice", "cowardly", "jump",
	"glow", "cultured", "voracious", "swing", "grease",
	"flood", "glue", "thoughtful", "flight", "bike",
	"drop", "hospitable", "therapeutic", "ill", "table",
	"pretend", "sea", "drip", "plain", "breath",
	"different", "thumb", "addition", "cuddly", "sin"
]
################################################################################

#Creation of Timer/Adding to Tree/Connecting Signal
################################################################################
func _ready():
	timer= Timer.new()
	add_child(timer)
	timer.connect("timeout",self,"_on_Timer_timeout")
	load_data()



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
		if Engine.get_time_scale() == 2.0:
			Engine.set_time_scale(1.0)
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
		"PomoDefense":
			return ("res://transitions/pomodefense_transition.tscn")
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
#Game Settings
################################################################################
#Loads Saved Game Settings
##########################
func load_data():
	var file = File.new()
	if not file.file_exists(SAVEFILE):
		_game_settings = {
			"bloom_on": false,
			"brightness": 1,
			"contrast": 1,
			"volume": -15,
		}
		save_data()
	else:
		file.open(SAVEFILE, File.READ)
		_game_settings = file.get_var()
		file.close()

#Saves Game Settings
##########################
func save_data():
	var file = File.new()
	file.open(SAVEFILE, File.WRITE)
	file.store_var(_game_settings)
	file.close()
################################################################################


################################################################################
# Gets a flashcard from the pool of selected flashcards
#	If the flashcard does not have 4 answers available, it pulls from the pool of
#	answers from other flashcards.
#   If there are still not enough flashcards, then it pulls from the pool of fake
#	answers 
#
# The returned flashcard is an array format: [question: string, correctAnswer: string, incorrectAnswers: Array]
# 	** incorrectAnswers is guaranteed to be of length 3.
#
# pickedRandomFlashcard[0] refers to the QUESTION STRING of the flashcard
# pickedRandomFlashcard[1] refers to the ANSWER STRING of the flashcard
# pickedRandomFlashcard[2] refers to the IS MULTIPLE CHOICE BOOLEAN of the flashcard
# pickedRandomFlashcard[3] refers to the INCORRECT ANSWERS ARRAY of the flashcard
################################################################################

func getRandomFlashcard():
	# Grab a random flashcard
	#print(_possibleAnswerPool);
	randomize()
	var pickedRandomFlashcardIndex = randi() % _flashcards.size()
	var pickedRandomFlashcard = _flashcards[pickedRandomFlashcardIndex]
	#print(pickedRandomFlashcard)

	# If the flashcard already has 3 incorrect answers, we can return the flashcard
	#print("picked random flashcard incorrect answer count: ", pickedRandomFlashcard[3].size())
	if pickedRandomFlashcard[3].size() == 3:
		return [ pickedRandomFlashcard[0], pickedRandomFlashcard[1], pickedRandomFlashcard[3] ]

	# If we have less than 3 incorrect answers, pull number of needed answers until we
	#	we have 3 incorrect answers
	var retrievedIncorrectAnswers = pickedRandomFlashcard[3]
	var counter = 1
	while retrievedIncorrectAnswers.size() != 3:
		
		# If we have run out of answers to use in the answer pool, fill with random fake answers
		if counter == _possibleAnswerPool.size():
			retrievedIncorrectAnswers.push_back(_fakeAnswerPool[randi() % _fakeAnswerPool.size()])
			continue
		
		var randomDummyAnswer = _possibleAnswerPool[randi() % _possibleAnswerPool.size()]
		counter = counter + 1
		
		if retrievedIncorrectAnswers.find(randomDummyAnswer) == -1 and randomDummyAnswer != pickedRandomFlashcard[1]:
			retrievedIncorrectAnswers.push_back(randomDummyAnswer)

	return [ pickedRandomFlashcard[0], pickedRandomFlashcard[1], retrievedIncorrectAnswers ]

func generatePossibleAnswersPool():
	_possibleAnswerPool.clear()
	for flashcard in _flashcards:
		_possibleAnswerPool.push_back(flashcard[1]) # add the correct answer to the flashcard
		for incorrectAnswer in flashcard[3]:
			_possibleAnswerPool.push_back(incorrectAnswer)



#	while retrievedIncorrectAnswers.size() != 3:
#		# Grab a random flashcard that is not the current flashcard
#		var randomFlashcardIndex = randi() % _flashcards.size()
#		if randomFlashcardIndex == pickedRandomFlashcardIndex:
#			continue
#
#		var randomFlashcardForDummyAnswers = _flashcards[randomFlashcardIndex]
#		# possibleDummyAnswers results in an array of the incorrect answers & the correct answer
#		var possibleDummyAnswers = [ randomFlashcardForDummyAnswers[1] ]
#		possibleDummyAnswers.append_array(randomFlashcardForDummyAnswers[3])
#
#		# Get the randomly selected dummy flashcard answer. If the answer already exists in the list
#		#  of retrievedIncorrectAnswers AND the answer matches the correct answer for the picked flashcard,
#		#  then repeat the loop.
#		var randomFlashcardDummyAnswer = possibleDummyAnswers[randi() % possibleDummyAnswers.size()]
#		if retrievedIncorrectAnswers.find(randomFlashcardDummyAnswer) != -1 and randomFlashcardDummyAnswer != pickedRandomFlashcard[1]:
#			retrievedIncorrectAnswers.push_back(randomFlashcardDummyAnswer)
