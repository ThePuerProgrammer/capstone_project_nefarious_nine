extends Control

# Clean bar vars
var cleanController
var cleanLevels = [5, 4, 3, 2, 1, 0]
var cleanLvl = 0

# Hunger bar vars
var hungerController
var hungerLvl = 0
var lastFedMs

# Happy bar vars
var happyLvl
var poopPercent
var poopController
var poopCount = 0
var lastPetMs
var timeElapsed = 0

var maxBar = 100

# On Feed action
var startHunger = 0 
var hungerIncrement = 0

# On Pet Clean action
var startCleanliness = 0 
var cleanIncrement = 0

# Called when the node enters the scene tree for the first time.
func _ready():
	var userDocFields = get_node("/root/CurrentUser").user_doc.doc_fields
	var pomopetData = userDocFields["pomopetData"]
	
	# CLEAN LEVEL BAR
	cleanController = get_node("../Pet")
	var cleanValue = cleanController.getDirtinessLevel(pomopetData["lastWashed"])
	cleanLvl = cleanLevels[cleanValue]
	updateCleanlinessBar()
	
	# HUNGER LEVEL BAR
	hungerController = get_node("../ActionController/FoodController")
	lastFedMs = userDocFields["pomopetData"]["lastFed"]
	hungerLvl = hungerController.getFoodLevel()
	updateHungerBar()
	
	# HAPPINESS LEVEL BAR
	poopController = get_node("../ActionController/PoopController")
	poopCount = poopController.getCurrentPoopCount()
	lastPetMs = userDocFields["pomopetData"]["lastPet"]
	var timeSinceLastPet = OS.get_system_time_msecs() - lastPetMs
	timeElapsed = floor(timeSinceLastPet / 1000 / 60 / 60 / 24) # time / ms / seconds / hour / day
	#print("LAST TIME PET IN DAYS:", timeElapsed)
	updateHappinessBar()
	
	# creating signal manually since in diff scene
	var petPetProgressBar = get_node("../Pet/PetMeter/ProgressBar")
	petPetProgressBar.connect("petMeterValueChange", self, "_on_petMeterProgressBar_value_changed")
	
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
	happyLvl = (cleanLvl + hungerLvl) * 10 # the higher the better
	poopPercent = (poopCount*2) / 100.0 # the lower the better

	
	#subtract poopPercent from happyLvl
	if happyLvl > 0:
		happyLvl -= (happyLvl * poopPercent)
	
	# for every day since last Pet, subtract 5% from happyLvl
	if ((happyLvl > 0) && (timeElapsed > 1)):
		happyLvl -= ((happyLvl * .05) * timeElapsed)

	if happyLvl == 0:
		$HappinessProgressBar.set_value(5)
	else:
		$HappinessProgressBar.set_value(happyLvl)

# UPDATE HUNGER BAR ON FEED
func _on_FoodController_feedStart():
	# Hunger on Feed Action start
	startHunger = $HungerProgressBar.get_value()
	
	# rectifying setting bar = 5 when actually zero
	if startHunger == 5:
		startHunger = 0
	
	# 100 - (Hunger on Feed Action start) / 10
	hungerIncrement = (maxBar - startHunger) / 10


func _on_FeedMeterProgressBar_value_changed(value):
	var currentHunger = $HungerProgressBar.get_value()

	# increment every 10% Feeding progress by hungerIncrement
	if fmod(value, 10) == 0:
		$HungerProgressBar.set_value(currentHunger + hungerIncrement)

# UPDATE CLEANLINESS BAR ON PET CLEAN
func _on_Pet_cleanStart():
	# Cleanliness on Pet Clean Action start
	startCleanliness = $CleanlinessProgressBar.get_value()
	
	# rectifying setting bar = 5 when actually zero
	if startCleanliness == 5:
		startCleanliness = 0
	
	# 100 - (Cleanliness on Pet Clean Action start) / 10
	cleanIncrement = (maxBar - startCleanliness) / 10
	
	# creating signal manually since in diff scene
	var washPetProgressBar = get_node("../Pet/WashMeter/WashMeterProgressBar")
	washPetProgressBar.connect("washMeterValueChange", self, "_on_washMeterProgressBar_value_changed")


func _on_washMeterProgressBar_value_changed(value):
	
	# only make change every 10 calls (bc increment is .1 not 1.0)
	if fmod(value, 1) == 0:
		var currentCleanliness = $CleanlinessProgressBar.get_value()
		
		# increment every 10% Cleaning progress by cleanIncrement
		if fmod(value, 10) == 0:
			$CleanlinessProgressBar.set_value(currentCleanliness + cleanIncrement)
	
# UPDATE HAPPINESS on feeding
func _on_HungerProgressBar_value_changed(value):
	hungerLvl = value/20
	updateHappinessBar()

# UPDATE HAPPINESS on wash pet
func _on_CleanlinessProgressBar_value_changed(value):
	cleanLvl = value/20
	#print("CLEAN LEVEL: ", cleanLvl)
	updateHappinessBar()

# UPDATE HAPPINESS on poop cleanup
func _on_PoopController_poopCountChange(poop):
	poopCount = poop
	updateHappinessBar()

# UPDATE HAPPINESS on petting
func _on_petMeterProgressBar_value_changed(value):
	if(value == 100):
		timeElapsed = 0
		updateHappinessBar()



