extends Node
################################################################################
#Signals
################################################################################
signal bloom_toggled(value)
signal brightness_updated(value)
signal contrast_updated(value)
################################################################################
func _ready():
	pass
#Functions
################################################################################
func toggle_bloom(value):
	emit_signal("bloom_toggled", value)
	print("Bloom in Global Settings")
	Pomotimer._game_settings.bloom = value
	Pomotimer.save_data()

func update_brightness(value):
	emit_signal("brightness_updated", value)
	print("Brightness in Global Settings")
	Pomotimer._game_settings.brightness = value
	Pomotimer.save_data()

func update_contrast(value):
	emit_signal("contrast_updated", value)
	print("Contrast in Global Settings")
	Pomotimer._game_settings.contrast = value
	Pomotimer.save_data()

func update_master_vol(vol):
	# 0 is used for the Master Bus Index
	AudioServer.set_bus_volume_db(0,vol)
	Pomotimer._game_settings.volume = vol
	Pomotimer.save_data()
