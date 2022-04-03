extends Control

var pomopet
var poopController
var feedController

func _ready():
	pomopet = get_node("../Pet")
	poopController = get_node("../ActionBarController/PoopController")
	feedController = get_node("../ActionBarController/FoodController")
