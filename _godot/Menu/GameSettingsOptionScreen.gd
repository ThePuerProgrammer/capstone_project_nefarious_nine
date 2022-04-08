extends Control
################################################################################
# Settings References
################################################################################
#Video
########################
onready var bloom_button = $BloomContainer/BloomToggle
onready var brightness_slider = $BrightnessContainer/BrightnessSlider
onready var contrast_slider = $ContrastContainer/ContrastSlider
#Audio
########################
onready var volume_slider = $VolumeContainer/VolumeSlider
################################################################################
func _ready():
	$FadeIn.show()
	$FadeIn.fade_in()
	bloom_button.pressed = Pomotimer._game_settings.bloom_on
	brightness_slider.value = Pomotimer._game_settings.brightness
	contrast_slider.value = Pomotimer._game_settings.contrast
	volume_slider.value = Pomotimer._game_settings.volume
################################################################################
##FADING IN & OUT
################################################################################
func _on_backButton_pressed():
	$FadeOut.show()
	$FadeOut.fade_out()

func _on_FadeIn_fade_in_finished():
	$FadeIn.hide()
################################################################################
##BUTTONS
################################################################################
#Back Button
########################
func _on_FadeOut_fade_out_finished():
	get_tree().change_scene('res://Menu/MenuScreen.tscn')
#Bloom Button
########################
func _on_BloomToggle_toggled(button_pressed):
	GlobalSettings.toggle_bloom(button_pressed)
	print("bloom in Options Menu")

#Brightness Button
########################
func _on_BrightnessSlider_value_changed(value):
	GlobalSettings.update_brightness(value)
	print("brightness in Options Menu")
#Contrast Slider
########################
func _on_ContrastSlider_value_changed(value):
	GlobalSettings.update_contrast(value)
	print("contrast in Options Menu")
#Volume Slider
########################
func _on_VolumeSlider_value_changed(vol):
	GlobalSettings.update_master_vol(vol)
	print("volume in Options Menu")

