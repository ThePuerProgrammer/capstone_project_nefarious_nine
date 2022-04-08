extends Node2D

signal cleanButtonPressed
signal feedButtonPressed
signal petButtonPressed
signal poopPickupButtonPressed

signal cleanStart

var effectController
var firebaseController
var poopController
var foodController
var actionBarVisible = false

var bunnySprite = load("res://ChillZone/pet/pet_sprites/bunny_sprite.png")
var catSprite = load("res://ChillZone/pet/pet_sprites/cat_sprite.png")
var dogSprite = load("res://ChillZone/pet/pet_sprites/rembo_sprite.png")
var currentPet

var petWashingModeOn = false 

var heartParticle = preload("res://ChillZone/pet_pomopet/MouseHeartParticles.tscn")
var pettingModeOn = false
var heartsOnCooldown = false

var mouseIsDown = false
var withinDogCollisionPolygon = false
var withinCatCollisionPolygon = false
var withinBunnyCollisionPolygon = false
var lastMouseMovePos
var currentMouseMovePos

var startDirtinessLevel
var startDirtinessValue
var petDirtinessLevel = 0

var dirtyLevels = [1.0, 0.8, 0.6, 0.4, 0.2, 0] # , 0 == Fully Dirty, 1 == Fully Clean
var progressBarMaxValue = 20

var state = 0
var movement = Vector2()

# Called when the node enters the scene tree for the first time.
func _ready():
	firebaseController = get_node("/root/FirebaseController")
	
	var userDocFields = get_node("/root/CurrentUser").user_doc.doc_fields
	currentPet = userDocFields["pomopet"]["type"]
	var pomopetData = userDocFields["pomopetData"]
	
	effectController = get_node("../ActionController/WashPomopetController/EffectController")
	poopController = get_node("../ActionController/PoopController")
	foodController = get_node("../ActionController/FoodController")
	
	updatePomopetSprite(currentPet)
	startDirtinessLevel = getDirtinessLevel(pomopetData["lastWashed"])
	startDirtinessValue = dirtyLevels[startDirtinessLevel]
	setPetDirtinessLevel(startDirtinessLevel)
	
	_getCurrentKinematicBody().connect("input_event", self, "_on_currentKinematicBodyInput")
	
	if startDirtinessLevel == 0:
		setCleanButtonEnabled(false)
	
	$WashMeter/WashMeterProgressBar.setMaxValue(progressBarMaxValue * startDirtinessLevel)
	$WashMeter/WashMeterProgressBar.reset()

# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(_delta):
	if Input.is_action_just_pressed("left_mouse_click"):
		mouseIsDown = true
		if actionBarVisible and isWithinPetTypeCollisionPolygon():
			$Timer.stop()
		if actionBarVisible and !isWithinPetTypeCollisionPolygon():
			actionBarVisible = false
			hideActionBar()
			$Timer.start()
	elif Input.is_action_just_released("left_mouse_click"):
		mouseIsDown = false
		
	
	if mouseIsDown and petWashingModeOn and isWithinPetTypeCollisionPolygon():
		if getScrubIntensity() > 1.5:
			$WashMeter/WashMeterProgressBar.incrementByStep()
			# Update the pet dirtiness (how much was already clean + how much we have cleaned so far)
			var remainingValueRangeToClean = 1 - dirtyLevels[startDirtinessLevel]
			var newDirtinessValue = dirtyLevels[startDirtinessLevel] + remainingValueRangeToClean * $WashMeter/WashMeterProgressBar.getPercentageComplete()
			setPetDirtiness(newDirtinessValue)
			
			# Check if we are done washing
			if newDirtinessValue == 1:
				effectController.playCleanEffects()
				firebaseController.updateCurrentUserLastWashed()
				hideCleaningProgressBar()
				petWashingModeOn = false
				setCleanButtonEnabled(false)
				
	if mouseIsDown and pettingModeOn and isWithinPetTypeCollisionPolygon():
		if getScrubIntensity() > 1.5:
			$PetMeter/ProgressBar.incrementByStep()
			
			# Check if we are done washing
			if $PetMeter/ProgressBar.getPercentageComplete() == 1:
				firebaseController.updateCurrentUserlastPet()
				hidePettingProgressBar()
				pettingModeOn = false
				setPetButtonEnabled(false)

# For tracking the distance between mouse positions
#	to determine "scrub intensity" (i.e. greater distance between mouse polls
#	means higher scrub intensity)
func _input(event):
	if event is InputEventMouseButton:
		lastMouseMovePos = event.position
		currentMouseMovePos = event.position
	if mouseIsDown and event is InputEventMouseMotion:
		currentMouseMovePos = event.position
	if !heartsOnCooldown and pettingModeOn and mouseIsDown and isWithinPetTypeCollisionPolygon() and event is InputEventMouseMotion:
		var heartsInstance = heartParticle.instance()
		heartsInstance.global_position = event.position
		get_node("../../ChillZone").add_child(heartsInstance)
		heartsInstance.emitting = true
		heartsOnCooldown = true
		$heartsCooldown.start()

func startPettingAction():
	pettingModeOn = true
	showPettingProgressBar()
	emit_signal("pettingStart")

func startCleanAction():
	petWashingModeOn = true
	showCleaningProgressBar()
	emit_signal("cleanStart")

# Set the dirtiness based off of preset dirty levels
func setPetDirtinessLevel(dirtinessLevel):
	petDirtinessLevel = dirtinessLevel
	_getCurrentPetSprite().material.set_shader_param("dissolve_amount", dirtyLevels[dirtinessLevel])
	
# Set the exact dirtiness level (Fully Dirty [0f] - Fully Clean [1f])
func setPetDirtiness(dirtinessValue):
	_getCurrentPetSprite().material.set_shader_param("dissolve_amount", dirtinessValue)

func getDirtinessLevel(lastTimeWashedMs):
	var timeSinceLastWashMs = OS.get_system_time_msecs() - lastTimeWashedMs # currentTime - lastTimeWashed
	var timeSinceLastWashDay = timeSinceLastWashMs / 1000 / 60 / 60 / 24 # time / ms / seconds / hour / day
	
	if timeSinceLastWashDay > 5: #0 is clean, 5 is dirty
		return 5
		
	return timeSinceLastWashDay

func updatePomopetSprite(petType):
	if petType == "bunny":
		$DogKinematicBody.hide()
		$CatKinematicBody.hide()
	elif petType == "dog":
		$CatKinematicBody.hide()
		$BunnyKinematicBody.hide()
	elif petType == "cat":
		$DogKinematicBody.hide()
		$BunnyKinematicBody.hide()

func getScrubIntensity():
	#if lastMouseMovePos == null or currentMouseMovePos == null:
	#	return 0
	
	var scrubIntensity = getDistanceBetweenMousePositions(lastMouseMovePos, currentMouseMovePos)
	lastMouseMovePos = currentMouseMovePos
	return scrubIntensity

func getDistanceBetweenMousePositions(pos1, pos2):
	return pow(pow(pos1.x - pos2.x, 2) + pow(pos1.y - pos2.y, 2), 0.5)

func showCleaningProgressBar():
	$WashMeter/WashMeterProgressBar/AnimationPlayer.play("fade_in")

func hideCleaningProgressBar():
	$WashMeter/WashMeterProgressBar/AnimationPlayer.play("fade_out")
	
func showPettingProgressBar():
	$PetMeter/ProgressBar/AnimationPlayer.play("fade_in")

func hidePettingProgressBar():
	$PetMeter/ProgressBar/AnimationPlayer.play("fade_out")

func isWithinPetTypeCollisionPolygon():
	if currentPet == "bunny":
		return withinBunnyCollisionPolygon
	elif currentPet == "dog":
		return withinDogCollisionPolygon
	elif currentPet == "cat":
		return withinCatCollisionPolygon
		
func move():
	if currentPet == "bunny":
		return $Sprite/BunnyClickDetection.move_and_slide()
	elif currentPet == "dog":
		return $Sprite/DogClickDetection.move_and_slide()
	elif currentPet == "cat":
		return $Sprite/BunnyClickDetection.move_and_slide()

func _getCurrentPetSprite():
	if currentPet == "bunny":
		return $BunnyKinematicBody/BunnySprite
	elif currentPet == "dog":
		return $DogKinematicBody/DogSprite
	elif currentPet == "cat":
		return $CatKinematicBody/CatSprite

func _getCurrentKinematicBody():
	if currentPet == "bunny":
		return $BunnyKinematicBody
	elif currentPet == "dog":
		return $DogKinematicBody
	elif currentPet == "cat":
		return $CatKinematicBody

func _on_BunnyKinematicBody_mouse_entered():
	withinBunnyCollisionPolygon = true


func _on_BunnyKinematicBody_mouse_exited():
	withinBunnyCollisionPolygon = false


func _on_CatKinematicBody_mouse_entered():
	withinCatCollisionPolygon = true


func _on_CatKinematicBody_mouse_exited():
	withinCatCollisionPolygon = false


func _on_DogKinematicBody_mouse_entered():
	withinDogCollisionPolygon = true


func _on_DogKinematicBody_mouse_exited():
	withinDogCollisionPolygon = false


func _on_CleanButton_pressed():
	emit_signal("cleanButtonPressed")


func _on_FeedButton_pressed():
	emit_signal("feedButtonPressed")


func _on_PetButton_pressed():
	emit_signal("petButtonPressed")
	startPettingAction()


func _on_PoopPickupButton_pressed():
	emit_signal("poopPickupButtonPressed")


func showActionBar():
	$ActionBar/AnimationPlayer.play("show_buttons")

func hideActionBar():
	$ActionBar/AnimationPlayer.play("hide_buttons")

func setCleanButtonEnabled(isEnabled):
	$ActionBar/CleanButton.disabled = !isEnabled

func setPetButtonEnabled(isEnabled):
	$ActionBar/PetButton.disabled = !isEnabled
	
func setFeedButtonEnabled(isEnabled):
	$ActionBar/FeedButton.disabled = !isEnabled

func setPickUpPoopButtonEnabled(isEnabled):
	$ActionBar/PoopPickupButton.disabled = !isEnabled

func canOpenActionBar():
	return !petWashingModeOn and !poopController.poopPickupModeOn and !foodController.feedingModeOn and !pettingModeOn # or petting mode on

func _on_currentKinematicBodyInput(_viewport, event, _shape_idx):
	if event is InputEventMouseButton and event.pressed and !actionBarVisible and canOpenActionBar(): # TODO: and canOpenActionBar
		var position = $CatKinematicBody.get_position()
		$ActionBar.rect_position(position, true)
		showActionBar()
		actionBarVisible = true


func _on_Pet_cleanButtonPressed():
	startCleanAction()

func _physics_process(delta):
	
	if(state == 0):
		movement.x = 100
		$BunnyKinematicBody/BunnySprite.flip_h = false
		$CatKinematicBody/CatSprite.flip_h = false
		$DogKinematicBody/DogSprite.flip_h = false
	if(state == 1):
		movement.x = -100
		$BunnyKinematicBody/BunnySprite.flip_h = true
		$CatKinematicBody/CatSprite.flip_h = true
		$DogKinematicBody/DogSprite.flip_h = true
	if(state == 2 || actionBarVisible || pettingModeOn || petWashingModeOn):
		movement.x = 0
	
	$BunnyKinematicBody.move_and_slide(movement, Vector2(0, -1))
	$CatKinematicBody.move_and_slide(movement, Vector2(0, -1))
	$DogKinematicBody.move_and_slide(movement, Vector2(0, -1))

func _on_Timer_timeout():
	state = floor(rand_range(0, 3))
