extends Control

# Clean bar vars
var cleanController
var cleanLevels = [5, 4, 3, 2, 1, 0]
var cleanLvl

# Hunger bar vars
var hungerController
var hungerLvl
var lastFedMs

# Happiness Bar Vars
var poopController
var poopCount

#var petController

# Called when the node enters the scene tree for the first time.
func _ready():
	var userDocFields = get_node("/root/CurrentUser").user_doc.doc_fields
	var pomopetData = userDocFields["pomopetData"]
	
	# CLEAN LEVEL BAR
	cleanController = get_node("../Pet")
	var cleanValue = cleanController.getDirtinessLevel(pomopetData["lastWashed"])
	cleanLvl = cleanLevels[cleanValue]
	#cleanLvl = 2 
	updateCleanlinessBar()
	
	# HUNGER LEVEL BAR
	hungerController = get_node("../ActionBarController/FoodController")
	lastFedMs = userDocFields["pomopetData"]["lastFed"]
	hungerLvl = hungerController.getFoodLevel()
	updateHungerBar()
	
	# HAPPINESS LEVEL BAR
	poopController = get_node("../ActionBarController/PoopController")
	poopCount = poopController.getCurrentPoopCount()
	updateHappinessBar()
	
# Called every frame. 'delta' is the elapsed time since the previous frame.
#func _process(delta):
#	pass

func updateCleanlinessBar():
	if cleanLvl == 0:
		$CleanlinessProgressBar.set_value(5)
	else:
		$CleanlinessProgressBar.set_value(cleanLvl*20)

func updateHungerBar():
	if hungerLvl == 0:
		$HungerProgressBar.set_value(5)
	else:
		$HungerProgressBar.set_value(hungerLvl*20)

func updateHappinessBar():
	var happyLvl = cleanLvl + hungerLvl # the higher the better
	var poopLvl = poopCount*2 # the lower the better
	# need to incorporate petting
	
	if happyLvl == 0:
		$HappinessProgressBar.set_value(5)
	elif happyLvl < poopLvl:
		$HappinessProgressBar.set_value(happyLvl*10)
	else:
		$HappinessProgressBar.set_value((happyLvl*10) - poopLvl)
