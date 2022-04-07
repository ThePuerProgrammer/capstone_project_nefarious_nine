extends Node

signal poopPickUpStart
signal poopPickUpEnd

signal poopCountChange

var poopScene = preload("res://ChillZone/poop_pomopet/Poop.tscn")
var _maxPoopCount = 15
var pomopet
var _currentPoopCount
var _startNumberOfPoops

var poopPickupModeOn = false 

var poopCurrentlyHeld

# Called when the node enters the scene tree for the first time.
func _ready():
	pomopet = get_node("../../Pet")
	_currentPoopCount = getCurrentPoopCount()
	_startNumberOfPoops = _currentPoopCount
	
	if _currentPoopCount == 0:
		pomopet.setPickUpPoopButtonEnabled(false)
		
	for n in _currentPoopCount:
		spawnPoop()

func getCurrentPoopCount():
	var _lastPooped = get_node("/root/CurrentUser").user_doc.doc_fields["pomopetData"]["lastPoopPickUp"]
	var timeSinceLastPoopPickUp = OS.get_system_time_msecs() - _lastPooped # currentTime - lastTimeWashed
	var howOftenPoopOccursHours = 12 # a poop occurs every howOftenPoopOccursHours hours
	var numberOfPoops = floor(timeSinceLastPoopPickUp / 1000 / 60 / 60 / howOftenPoopOccursHours) # time / ms / seconds / hour / howOftenPoopOccursHours
	
	if numberOfPoops > _maxPoopCount:
		return _maxPoopCount
	
	return numberOfPoops
	
func getRandomPoopPosition():
	randomize()
	var randXPositionMultiplier = rand_range(0, 1)
	randomize()
	var randYPositionMultiplier = rand_range(0, 1)
	return Vector2($PoopRegion.get_rect().position.x + ($PoopRegion.get_rect().size.x * randXPositionMultiplier), $PoopRegion.get_rect().position.y + ($PoopRegion.get_rect().size.y * randYPositionMultiplier))

func spawnPoop():
	var poopInstance = poopScene.instance()
	poopInstance.global_position = getRandomPoopPosition() # set where particle effect appears (mouse pos)
	if poopInstance.global_position.y > 660:
		poopInstance.z_index = 1
	else:
		poopInstance.z_index = -1 
	add_child(poopInstance)
	#print("poop added")

func startPoopPickupAction():
	poopPickupModeOn = true
	$Trashcan.show()
	emit_signal("poopPickUpStart")

func endPoopPickupAction():
	FirebaseController.updateCurrentUserLastPoopPickUp() # update last poop pickup time to now
	poopPickupModeOn = false
	$Trashcan.hideTrashcan()
	emit_signal("poopPickUpEnd")
	pomopet.setPickUpPoopButtonEnabled(false)

func _on_Area2D_body_entered(body):
	body.queue_free()
	
	var activePoops = get_tree().get_nodes_in_group("Poops")
	
	var poopInOpenRegion = 0
	for p in activePoops:
		print("poopfound")
		if $Trashcan/OpenTrashcanArea.overlaps_body(p.getRigidBody()):
			poopInOpenRegion = poopInOpenRegion + 1
	
	if poopInOpenRegion == 1:
		$Trashcan.closeTrashCan()
		
	_currentPoopCount = _currentPoopCount - 1
	emit_signal("poopCountChange", _currentPoopCount)
	if _currentPoopCount == 0:
		endPoopPickupAction()


func _on_Pet_poopPickupButtonPressed():
	print("poop pickup")
	startPoopPickupAction()
