extends Node2D

onready var pos_wall = $POSWall
onready var pos_zoom = $POSZoom

onready var pos_screen = $POSZoom/POSScreen

var pos_right_usable = false
var pos_left_usable = false

var pos_table_menu = preload("res://assets/textures/PomoBITE_Textures/Table_Menu.png")
var pos_default_screen = preload("res://assets/textures/PomoBITE_Textures/Inner_Monitor_Tables.png")

var selected_table = 1

var show_hint = true

onready var table_buttons = [
	$POSZoom/POSScreen/Table1Button,
	$POSZoom/POSScreen/Table2Button,
	$POSZoom/POSScreen/Table3Button,
	$POSZoom/POSScreen/Table4Button,
	$POSZoom/POSScreen/Table5Button,
	$POSZoom/POSScreen/Table6Button,
	$POSZoom/POSScreen/Table7Button,
	$POSZoom/POSScreen/Table8Button,
	$POSZoom/POSScreen/Table9Button,
	$POSZoom/POSScreen/Table10Button,
	$POSZoom/POSScreen/Table11Button,
	$POSZoom/POSScreen/Table12Button,
]

func _ready():
	$POSZoom/POSScreen/BackButton.disabled = true
	pos_wall.visible = false
	pos_zoom.visible = false
	$Player1.visible = true
	$Player2.visible = true
	if $Player1.connect("interact", self, "_on_player_1_interact") != OK:
		print("Cannot connect signals")
	
func _on_player_1_interact():
#	show_hint = false
	$PopupDialog.hide()
	if pos_right_usable or pos_left_usable:
		if !pos_wall.visible:
			pos_wall.visible = true
			pos_zoom.visible = true
			$Player1.visible = false
			$Player1.movable = false
			$Player2.visible = false
		else:
			_on_BackButton_pressed()
			pos_wall.visible = false
			pos_zoom.visible = false
			$Player1.visible = true
			$Player1.movable = true
			$Player2.visible = true

# POS LOGIC
####################################################################################################
func _on_Table1Button_pressed():
	selected_table = 1
	_go_to_table_menu()

func _on_Table2Button_pressed():
	selected_table = 2
	_go_to_table_menu()

func _on_Table3Button_pressed():
	selected_table = 3
	_go_to_table_menu()
	
func _on_Table4Button_pressed():
	selected_table = 4
	_go_to_table_menu()
	
func _on_Table5Button_pressed():
	selected_table = 5
	_go_to_table_menu()
	
func _on_Table6Button_pressed():
	selected_table = 6
	_go_to_table_menu()
	
func _on_Table7Button_pressed():
	selected_table = 7
	_go_to_table_menu()
	
func _on_Table8Button_pressed():
	selected_table = 8
	_go_to_table_menu()
	
func _on_Table9Button_pressed():
	selected_table = 9
	_go_to_table_menu()
	
func _on_Table10Button_pressed():
	selected_table = 10
	_go_to_table_menu()
	
func _on_Table11Button_pressed():
	selected_table = 11
	_go_to_table_menu()
	
func _on_Table12Button_pressed():
	selected_table = 12
	_go_to_table_menu()

func _on_POS_right_area_entered(_area):
	if show_hint:
		$PopupDialog.rect_position = Vector2($LevelSprites/POS1.position.x + 20, $LevelSprites/POS1.position.y - 60)
		$PopupDialog.popup()
	pos_right_usable = true

func _on_POS_left_area_entered(_area):
	if show_hint:
		$PopupDialog.rect_position = Vector2($LevelSprites/POS2.position.x + 20, $LevelSprites/POS2.position.y - 60)
		$PopupDialog.popup()
	pos_left_usable = true

func _on_POS_right_area_exited(_area):
	$PopupDialog.hide()
	pos_right_usable = false

func _on_POS_left_area_exited(_area):
	$PopupDialog.hide()
	pos_left_usable = false
	
func _go_to_table_menu():
	for table in table_buttons:
		table.disabled = true
	$POSZoom/POSScreen/BackButton.disabled = false
	pos_screen.set_texture(pos_table_menu)

func _on_BackButton_pressed():
	for table in table_buttons:
		table.disabled = false
	$POSZoom/POSScreen/BackButton.disabled = true
	pos_screen.set_texture(pos_default_screen)
####################################################################################################


func _on_Table1_area_entered(area):
	pass # Replace with function body.


func _on_Table1_area_exited(area):
	pass # Replace with function body.


func _on_Table2_area_entered(area):
	pass # Replace with function body.


func _on_Table2_area_exited(area):
	pass # Replace with function body.


func _on_Table3_area_entered(area):
	pass # Replace with function body.


func _on_Table3_area_exited(area):
	pass # Replace with function body.


func _on_Table4_area_entered(area):
	pass # Replace with function body.


func _on_Table4_area_exited(area):
	pass # Replace with function body.


func _on_Table5_area_entered(area):
	pass # Replace with function body.


func _on_Table5_area_exited(area):
	pass # Replace with function body.


func _on_Table6_area_entered(area):
	pass # Replace with function body.


func _on_Table6_area_exited(area):
	pass # Replace with function body.


func _on_Table7_area_entered(area):
	pass # Replace with function body.


func _on_Table7_area_exited(area):
	pass # Replace with function body.


func _on_Table8_area_entered(area):
	pass # Replace with function body.


func _on_Table8_area_exited(area):
	pass # Replace with function body.


func _on_Table9_area_entered(area):
	pass # Replace with function body.


func _on_Table9_area_exited(area):
	pass # Replace with function body.


func _on_Table10_area_entered(area):
	pass # Replace with function body.


func _on_Table10_area_exited(area):
	pass # Replace with function body.


func _on_Table11_area_entered(area):
	pass # Replace with function body.


func _on_Table11_area_exited(area):
	pass # Replace with function body.


func _on_Table12_area_entered(area):
	pass # Replace with function body.


func _on_Table12_area_exited(area):
	pass # Replace with function body.
