extends Node2D

onready var pos_wall = $POSWall
onready var pos_zoom = $POSZoom

onready var pos_screen = $POSZoom/POSScreen

var pos_right_usable = false
var pos_left_usable = false
var tables = {
	tables_entered = [
		false, false, false, false, false, false,
		false, false, false, false, false, false
	],
}

var soda_machine_area_entered = false
var expo_area_entered = false
var trash_area_entered = false

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
		$PopupDialog.rect_position = Vector2($LevelSprites/POS1.position.x - 40, $LevelSprites/POS1.position.y - 60)
		$PopupDialog.popup()
	pos_right_usable = true

func _on_POS_left_area_entered(_area):
	if show_hint:
		$PopupDialog.rect_position = Vector2($LevelSprites/POS2.position.x - 40, $LevelSprites/POS2.position.y - 60)
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

# TABLES LOGIC
####################################################################################################
func _on_Table1_area_entered(_area):
	set_table_popup($Area2Ds/TableAreas/Table1, 1)


func _on_Table1_area_exited(_area):
	hide_table_popup(1)
	

func _on_Table2_area_entered(_area):
	set_table_popup($Area2Ds/TableAreas/Table2, 2)


func _on_Table2_area_exited(_area):
	hide_table_popup(2)


func _on_Table3_area_entered(_area):
		set_table_popup($Area2Ds/TableAreas/Table3, 3)


func _on_Table3_area_exited(_area):
	hide_table_popup(3)


func _on_Table4_area_entered(_area):
	set_table_popup($Area2Ds/TableAreas/Table4, 4)


func _on_Table4_area_exited(_area):
	hide_table_popup(4)


func _on_Table5_area_entered(_area):
	set_table_popup($Area2Ds/TableAreas/Table5, 5)


func _on_Table5_area_exited(_area):
	hide_table_popup(5)


func _on_Table6_area_entered(_area):
	set_table_popup($Area2Ds/TableAreas/Table6, 6)


func _on_Table6_area_exited(_area):
	hide_table_popup(6)


func _on_Table7_area_entered(_area):
	set_table_popup($Area2Ds/TableAreas/Table7, 7)


func _on_Table7_area_exited(_area):
	hide_table_popup(7)


func _on_Table8_area_entered(_area):
	set_table_popup($Area2Ds/TableAreas/Table8, 8)


func _on_Table8_area_exited(_area):
	hide_table_popup(8)


func _on_Table9_area_entered(_area):
	set_table_popup($Area2Ds/TableAreas/Table9, 9)


func _on_Table9_area_exited(_area):
	hide_table_popup(9)


func _on_Table10_area_entered(_area):
	set_table_popup($Area2Ds/TableAreas/Table10, 10)


func _on_Table10_area_exited(_area):
	hide_table_popup(10)


func _on_Table11_area_entered(_area):
	set_table_popup($Area2Ds/TableAreas/Table11, 11)


func _on_Table11_area_exited(_area):
	hide_table_popup(11)


func _on_Table12_area_entered(_area):
	set_table_popup($Area2Ds/TableAreas/Table12, 12)


func _on_Table12_area_exited(_area):
	hide_table_popup(12)


func set_table_popup(var table, var number):
	$PopupDialog.rect_position = table.position
	$PopupDialog.rect_position.x -= 42
	if number == 5 or number == 6 or number == 11 or number == 12:
		$PopupDialog.rect_position.x += 12
	$PopupDialog.popup()
	tables['tables_entered'][number - 1] = true
	
func hide_table_popup(var number):
	var all_exited = true
	for table in tables['tables_entered']:
		if table:
			all_exited == false
	if all_exited:		
		$PopupDialog.hide()
	tables['tables_entered'][number - 1] = false
	
####################################################################################################

# SODA LOGIC
####################################################################################################
func _on_Soda1_area_entered(_area):
	show_soda_popup($Area2Ds/SodaAreas/Soda1)


func _on_Soda1_area_exited(_area):
	hide_soda_popup()


func _on_Soda2_area_entered(_area):
	show_soda_popup($Area2Ds/SodaAreas/Soda2)


func _on_Soda2_area_exited(_area):
	hide_soda_popup()


func _on_Soda3_area_entered(_area):
	show_soda_popup($Area2Ds/SodaAreas/Soda3)


func _on_Soda3_area_exited(_area):
	hide_soda_popup()


func _on_Soda4_area_entered(_area):
	show_soda_popup($Area2Ds/SodaAreas/Soda4)


func _on_Soda4_area_exited(_area):
	hide_soda_popup()
	
func show_soda_popup(var machine):
	soda_machine_area_entered = true
	$PopupDialog.rect_position = machine.position
	$PopupDialog.popup()
	
func hide_soda_popup():
	soda_machine_area_entered = false
	$PopupDialog.hide()

####################################################################################################

# TRASH LOGIC
####################################################################################################
func _on_Trash1_area_entered(_area):
	show_trash_popup($Area2Ds/TrashAreas/Trash1)


func _on_Trash1_area_exited(_area):
	hide_trash_popup()


func _on_Trash2_area_entered(_area):
	show_trash_popup($Area2Ds/TrashAreas/Trash2)


func _on_Trash2_area_exited(_area):
	hide_trash_popup()
	
func show_trash_popup(var trashcan):
	trash_area_entered = true
	$PopupDialog.rect_position = trashcan.position
	$PopupDialog.rect_position.x -= 40
	$PopupDialog.rect_position.y -= 80
	$PopupDialog.show()
	
func hide_trash_popup():
	trash_area_entered = false
	$PopupDialog.hide()
	
####################################################################################################

# EXPO LOGIC
####################################################################################################
func _on_Expo1_area_entered(_area):
	show_expo_popup($Area2Ds/ExpoAreas/Expo1)


func _on_Expo1_area_exited(_area):
	hide_expo_popup()


func _on_Expo2_area_entered(_area):
	show_expo_popup($Area2Ds/ExpoAreas/Expo2)


func _on_Expo2_area_exited(_area):
	hide_expo_popup()


func show_expo_popup(var expo):
	expo_area_entered = true
	$PopupDialog.rect_position = expo.position
	$PopupDialog.rect_position.x += 52
	$PopupDialog.rect_position.y -= 80
	$PopupDialog.show()

func hide_expo_popup():
	expo_area_entered = false
	$PopupDialog.hide()
	
####################################################################################################

# DISHPIT LOGIC
####################################################################################################
func _on_DishPit1_area_entered(_area):
	pass # Replace with function body.


func _on_DishPit1_area_exited(_area):
	pass # Replace with function body.


func _on_DishPit2_area_entered(_area):
	pass # Replace with function body.


func _on_DishPit2_area_exited(_area):
	pass # Replace with function body.

####################################################################################################
