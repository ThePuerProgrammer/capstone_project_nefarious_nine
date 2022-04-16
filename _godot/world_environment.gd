extends WorldEnvironment

func _ready():
	GlobalSettings.connect("bloom_toggled", self,"_on_bloom_toggled")
	GlobalSettings.connect("brightness_updated", self, "_on_brightness_updated")
	GlobalSettings.connect("contrast_updated", self, "_on_contrast_updated")
	pass
func _on_bloom_toggled(value):
	environment.glow_enabled = value
	environment.glow_bloom = 0.3
	#print("Bloom in WORLD")
	
func _on_brightness_updated(value):
	environment.adjustment_brightness = value
	#print("Brightness in WORLD",environment.glow_bloom,environment.glow_enabled)

func _on_contrast_updated(value):
	environment.adjustment_contrast = value
	#print("Contrast in WORLD",environment.glow_bloom,environment.glow_enabled)

