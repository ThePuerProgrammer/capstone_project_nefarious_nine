extends Node

var poopScene = preload("res://ChillZone/poop_pomopet/Poop.tscn")
var _maxPoopCount = 15

# Called when the node enters the scene tree for the first time.
func _ready():
	for n in getCurrentPoopCount():
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
	print("poop added")
