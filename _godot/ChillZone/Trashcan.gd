extends Node2D

var poopIsHeld = false
var poopPickupModeOn = false 
var trashCanOpened = false # Starting at false prevents sound effect from playing on appear

var withinMouseArea = false
var poopReleasedWithinZone = false

var poopsDestroyed = 0

signal _on_TrashcanCloseSound_finished
signal _on_TrashcanOpenSound_finished

func _process(delta):
	if Input.is_action_just_released("left_mouse_click") and poopIsHeld:
		poopReleasedWithinZone = true

# Called when the node enters the scene tree for the first time.
func _ready():
	pass

func openTrashCan():
	if !trashCanOpened:
		$TrashcanOpenSound.play()
	
	$TrashcanClosed.hide()
	$TrashcanOpen.show()
	
	trashCanOpened = true

func closeTrashCan():
	if trashCanOpened:
		$TrashcanCloseSound.play()
	
	$TrashcanOpen.hide()
	$TrashcanClosed.show()
	trashCanOpened = false

func _on_Area2D_body_entered(body):
	openTrashCan()

func _on_Area2D_body_exited(body):
	if poopPickupModeOn and wasLastPoopInOpenArea():
		closeTrashCan()

func _on_OpenTrashcanArea_mouse_entered():
	withinMouseArea = true
	if poopIsHeld and poopPickupModeOn:
		openTrashCan()

func _on_OpenTrashcanArea_mouse_exited():
	withinMouseArea = false
	if poopIsHeld and poopPickupModeOn:
		closeTrashCan()

func _on_PoopController_poopPickUpStart():
	poopPickupModeOn = true
	showTrashcan()

func _on_PoopController_poopPickUpEnd():
	poopPickupModeOn = false
	hideTrashcan()

func showTrashcan():
	$CloudPuffParticle.emitting = true
	yield(get_tree().create_timer($CloudPuffParticle.lifetime / 2), "timeout")
	closeTrashCan()

func hideTrashcan():
	yield(get_tree().create_timer(0.25), "timeout") # Wait 1 second before hiding trashcan
	$CloudPuffParticle.emitting = true
	yield(get_tree().create_timer($CloudPuffParticle.lifetime / 4), "timeout")
	$TrashcanOpen.hide()
	$TrashcanClosed.hide()

# If cloud isn't playing (emitting), then the trashcan is ready
func trashcanReady():
	return !$CloudPuffParticle.emitting


func _on_TrashcanOpenSound_finished():
	$TrashcanCloseSound.stop()
	emit_signal("_on_TrashcanOpenSound_finished")


func _on_TrashcanCloseSound_finished():
	$TrashcanOpenSound.stop()
	emit_signal("_on_TrashcanCloseSound_finished")


func wasLastPoopInOpenArea():
	var activePoops = get_tree().get_nodes_in_group("Poops")
	
	var poopInOpenRegion = 0
	for p in activePoops:
		if $OpenTrashcanArea.overlaps_body(p.getRigidBody()):
			poopInOpenRegion = poopInOpenRegion + 1
	
	return poopInOpenRegion == 0
