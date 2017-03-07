This is an overview of the currently available objects and their parameters in Xebra. For more information about these objects, their functionality, and the functionality of each of their parameters, see the Max documentation. The reference guide is available from within Max, and also online at {@link https://docs.cycling74.com/max7/}
```
button

	* patching_rect
	* presentation_rect
	* zorder
	* presentation
	* hidden
	* ignoreclick
	* varname
	* bgcolor
	* blinkcolor
	* outlinecolor
	* value

comment

	* patching_rect
	* presentation_rect
	* zorder
	* presentation
	* hidden
	* ignoreclick
	* varname
	* textfield
	* fontsize
	* textjustification
	* fontname
	* fontface
	* bgcolor
	* textcolor
	* bubble
	* bubblepoint
	* bubbleside
	* bubbletextmargin

dial

	* patching_rect
	* presentation_rect
	* zorder
	* presentation
	* hidden
	* ignoreclick
	* varname
	* distance
	* floatoutput
	* mode
	* size
	* min
	* mult
	* degrees
	* thickness
	* bgcolor
	* needlecolor
	* outlinecolor

flonum

	* patching_rect
	* presentation_rect
	* zorder
	* presentation
	* hidden
	* ignoreclick
	* varname
	* value
	* fontsize
	* fontname
	* fontface
	* bgcolor
	* textcolor
	* tricolor
	* triscale
	* numdecimalplaces
	* htricolor

fpic

	* patching_rect
	* presentation_rect
	* zorder
	* presentation
	* hidden
	* ignoreclick
	* varname
	* alpha
	* destrect
	* autofit
	* xoffset
	* yoffset
	* pic

gain~

	* patching_rect
	* presentation_rect
	* zorder
	* presentation
	* hidden
	* ignoreclick
	* varname
	* value
	* size
	* orientation
	* bgcolor
	* stripecolor
	* knobcolor
	* distance

kslider

	* patching_rect
	* presentation_rect
	* zorder
	* presentation
	* hidden
	* ignoreclick
	* varname
	* value
	* blackkeycolor
	* hkeycolor
	* mode
	* offset
	* range
	* selectioncolor
	* whitekeycolor
	* rawsend

live.button

	* patching_rect
	* presentation_rect
	* zorder
	* presentation
	* hidden
	* ignoreclick
	* varname
	* active
	* bgcolor
	* bgoncolor
	* activebgcolor
	* activebgoncolor
	* bordercolor
	* focusbordercolor
	* value

live.dial

	* patching_rect
	* presentation_rect
	* zorder
	* presentation
	* hidden
	* ignoreclick
	* varname
	* fontname
	* fontsize
	* fontface
	* active
	* activedialcolor
	* activeneedlecolor
	* appearance
	* bordercolor
	* dialcolor
	* focusbordercolor
	* needlecolor
	* panelcolor
	* showname
	* shownumber
	* textcolor
	* triangle
	* tribordercolor
	* tricolor
	* distance
	* _parameter_shortname
	* _parameter_unitstyle
	* _parameter_range
	* _parameter_exponent
	* value

live.grid

	* patching_rect
	* presentation_rect
	* zorder
	* presentation
	* hidden
	* ignoreclick
	* varname
	* amountcolor
	* bgstepcolor
	* bgstepcolor2
	* bordercolor
	* bordercolor2
	* columns
	* direction
	* direction_height
	* directioncolor
	* displayamount
	* freezecolor
	* hbgcolor
	* link
	* marker_horizontal
	* marker_vertical
	* matrixmode
	* mode
	* rounded
	* rows
	* spacing
	* stepcolor
	* distance
	* touchy

live.numbox

	* patching_rect
	* presentation_rect
	* zorder
	* presentation
	* hidden
	* ignoreclick
	* varname
	* activebgcolor
	* active
	* activeslidercolor
	* activetricolor
	* activetricolor2
	* appearance
	* bordercolor
	* focusbordercolor
	* textcolor
	* tricolor
	* tricolor2
	* value
	* fontname
	* fontface
	* fontsize
	* _parameter_range
	* _parameter_unitstyle
	* _parameter_exponent

live.slider

	* patching_rect
	* presentation_rect
	* zorder
	* presentation
	* hidden
	* ignoreclick
	* varname
	* fontname
	* fontsize
	* fontface
	* orientation
	* showname
	* shownumber
	* slidercolor
	* textcolor
	* tribordercolor
	* trioncolor
	* tricolor
	* _parameter_range
	* _parameter_shortname
	* _parameter_unitstyle
	* _parameter_exponent
	* value
	* distance

live.tab

	* patching_rect
	* presentation_rect
	* zorder
	* presentation
	* hidden
	* ignoreclick
	* varname
	* active
	* activebgcolor
	* activebgoncolor
	* bgcolor
	* bgoncolor
	* blinktime
	* bordercolor
	* button
	* focusbordercolor
	* mode
	* multiline
	* num_lines_patching
	* num_lines_presentation
	* pictures
	* rounded
	* spacing_x
	* spacing_y
	* textcolor
	* textoncolor
	* fontname
	* fontsize
	* fontface
	* _parameter_range
	* value
	* usepicture

live.text

	* patching_rect
	* presentation_rect
	* zorder
	* presentation
	* hidden
	* ignoreclick
	* varname
	* activebgcolor
	* active
	* bgcolor
	* activebgoncolor
	* bgoncolor
	* bordercolor
	* textcolor
	* activetextoncolor
	* activetextcolor
	* text
	* texton
	* value
	* fontsize
	* fontname
	* fontface
	* pictures
	* usepicture

live.toggle

	* patching_rect
	* presentation_rect
	* zorder
	* presentation
	* hidden
	* ignoreclick
	* varname
	* bgcolor
	* activebgcolor
	* bgoncolor
	* activebgoncolor
	* bordercolor
	* focusbordercolor
	* value
	* rounded
	* active

message

	* patching_rect
	* presentation_rect
	* zorder
	* presentation
	* hidden
	* ignoreclick
	* varname
	* textfield
	* fontsize
	* textjustification
	* fontname
	* fontface
	* bgcolor
	* bgfillcolor_color
	* bgfillcolor_type
	* bgfillcolor_pt1
	* bgfillcolor_pt2
	* bgfillcolor_color1
	* bgfillcolor_color2
	* bgfillcolor_color
	* bgfillcolor_proportion
	* bgfillcolor_angle
	* textcolor
	* value

meter~

	* patching_rect
	* presentation_rect
	* zorder
	* presentation
	* hidden
	* ignoreclick
	* varname
	* bgcolor
	* offcolor
	* ntepidleds
	* nwarmleds
	* nhotleds
	* numleds
	* dbperled
	* coldcolor
	* tepidcolor
	* warmcolor
	* hotcolor
	* overloadcolor
	* level

mira.multitouch

	* patching_rect
	* presentation_rect
	* zorder
	* presentation
	* hidden
	* ignoreclick
	* varname
	* color
	* hsegments
	* vsegments
	* region
	* pinch
	* pinch_enabled
	* rotate
	* rotate_enabled
	* tap
	* tap_enabled
	* tap_touch_count
	* tap_tap_count
	* swipe
	* swipe_enabled
	* swipe_touch_count
	* remote_gestures
	* remote_circles
	* moved_touch
	* up_down_cancelled_touch

multislider

	* patching_rect
	* presentation_rect
	* zorder
	* presentation
	* hidden
	* ignoreclick
	* varname
	* distance
	* ghostbar
	* setstyle
	* candycane
	* size
	* setminmax
	* orientation
	* thickness
	* bgcolor
	* slidercolor
	* candicane2
	* candicane3
	* candicane4
	* candicane5
	* candicane6
	* candicane7
	* candicane8
	* peakcolor
	* drawpeaks
	* signed
	* spacing

number

	* patching_rect
	* presentation_rect
	* zorder
	* presentation
	* hidden
	* ignoreclick
	* varname
	* value
	* fontsize
	* fontname
	* fontface
	* bgcolor
	* textcolor
	* tricolor
	* triscale
	* numdecimalplaces
	* htricolor

panel

	* patching_rect
	* presentation_rect
	* zorder
	* presentation
	* hidden
	* ignoreclick
	* varname
	* bgcolor
	* bgfillcolor_color
	* bgfillcolor_type
	* bgfillcolor_pt1
	* bgfillcolor_pt2
	* bgfillcolor_color1
	* bgfillcolor_color2
	* bgfillcolor_color
	* bgfillcolor_proportion
	* bgfillcolor_angle
	* bordercolor
	* border
	* rounded
	* shape
	* horizontal_direction
	* vertical_direction
	* arrow_orientation

rslider

	* patching_rect
	* presentation_rect
	* zorder
	* presentation
	* hidden
	* ignoreclick
	* varname
	* distance
	* size
	* min
	* mult
	* orientation
	* drawline
	* bgcolor
	* bordercolor
	* fgcolor

slider

	* patching_rect
	* presentation_rect
	* zorder
	* presentation
	* hidden
	* ignoreclick
	* varname
	* bgcolor
	* distance
	* elementcolor
	* floatoutput
	* knobcolor
	* knobshape
	* min
	* mult
	* orientation
	* size
	* thickness

swatch

	* patching_rect
	* presentation_rect
	* zorder
	* presentation
	* hidden
	* ignoreclick
	* varname
	* distance
	* value
	* compatibility
	* saturation

toggle

	* patching_rect
	* presentation_rect
	* zorder
	* presentation
	* hidden
	* ignoreclick
	* varname
	* bgcolor
	* checkedcolor
	* uncheckedcolor
	* thickness
	* value

umenu

	* patching_rect
	* presentation_rect
	* zorder
	* presentation
	* hidden
	* ignoreclick
	* varname
	* arrow
	* applycolors
	* bgcolor
	* bgfillcolor_type
	* bgfillcolor_color1
	* bgfillcolor_color2
	* bgfillcolor_pt1
	* bgfillcolor_pt2
	* bgfillcolor_color
	* bgfillcolor_proportion
	* bgfillcolor_angle
	* color
	* elementcolor
	* fontname
	* fontsize
	* fontface
	* items
	* menumode
	* textcolor
	* textjustification
	* truncate
	* underline
	* value
```