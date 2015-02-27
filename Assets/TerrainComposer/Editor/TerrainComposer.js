#pragma downcast
import System.IO;
import System;
import System.Collections.Generic;
import System.Text;


class TerrainComposer extends EditorWindow 
{
    var source: GameObject;
    var count_terrain: int;
    var counter2: int;
    var count_filter: int;
    var count_subfilter: int;
    var button0_texture: Texture = AssetDatabase.LoadAssetAtPath("Assets/TerrainComposer/Buttons/button_colormap.png",Texture);
    var button1_texture: Texture = AssetDatabase.LoadAssetAtPath("Assets/TerrainComposer/Buttons/button_splatmap.png",Texture);
    var palette_texture: Texture = AssetDatabase.LoadAssetAtPath("Assets/TerrainComposer/Buttons/Palette.png",Texture);  
    var button2_texture: Texture = AssetDatabase.LoadAssetAtPath("Assets/TerrainComposer/Buttons/button_tree.png",Texture);
    var button3_texture: Texture = AssetDatabase.LoadAssetAtPath("Assets/TerrainComposer/Buttons/button_grass.png",Texture);
    var button4_texture: Texture = AssetDatabase.LoadAssetAtPath("Assets/TerrainComposer/Buttons/button_objects.png",Texture);
    var button5_texture: Texture = AssetDatabase.LoadAssetAtPath("Assets/TerrainComposer/Buttons/button_savedisk.png",Texture);
    var button6_texture: Texture = AssetDatabase.LoadAssetAtPath("Assets/TerrainComposer/Buttons/button_heightmap.png",Texture);
    var button7_texture: Texture = AssetDatabase.LoadAssetAtPath("Assets/TerrainComposer/Buttons/button_tools.png",Texture); 
    var button8_texture: Texture = AssetDatabase.LoadAssetAtPath("Assets/TerrainComposer/Buttons/button_measure_tool.png",Texture); 
    var button9_texture: Texture = AssetDatabase.LoadAssetAtPath("Assets/TerrainComposer/Buttons/button_meshcapture_tool.png",Texture);
    var progress_bar: float;
    var set_pass: boolean = false;
    var lost_focus: boolean = false;
    var run_in_background: boolean;
    
   	var curve_copy: AnimationCurve = new AnimationCurve();
   	var curve_layer_position: int = -1;
   	var curve_filter_position: int = -1;
   	var curve_subfilter_position: int = -1; 
	static var disabled: boolean = false;
    
    static var new_window: boolean = false;
    var new_description: boolean = false;
    var new_description_number: int;
    var current_layer_number: int;
    var current_prelayer_number: int;
    var current_description_number: int;
 	var current_tree_number: int;
 	var current_terrain: terrain_class;
 	
    var key: Event;
    static var e_old: Event;
    var mouse_position: Vector2;
    var count_something: float = 0;
    static var content_checked: boolean = false;

    static var first_init: boolean = false;
    
    var current_layer: layer_class;
    var current_filter: filter_class;
    var current_subfilter: subfilter_class;
    var current_preimage: image_class;
    var current_precolor_range: precolor_range_class;
	
	static var window: EditorWindow;
	
	var scrollPos: Vector2;
	var lastRect2: Rect;
	var last_control: String;
	
    static var TerrainComposer_Scene: GameObject;
    static var script: terraincomposer_save;
    static var script2: terraincomposer_save;
    static var Generate_Scene: GameObject;
    static var Generate_Scene_name: String;
	var texture_tool: EditorWindow;
    var measure_tool: EditorWindow;
    var preview_window: ShowTexture;
    var measure_tool_id: int;
    static var script_set: boolean = false;
    static var script_failed: boolean = false;
    
    static var Save_Layer: GameObject;
    static var script3: save_template;
    
    static var terrain_reference: boolean = true;
    static var object_reference: boolean = true;
    
    var path: String;
    
    var filter_text: String;
    var filter_text2: String;
    var subfilter_text: String;
    var subfilter_text2: String;
   	var gui_changed_old: boolean;
   	var gui_changed_old2: boolean;
   	var time_generate_call: float;
   	
   	static var terrain_measure: Terrain;
   	static var hit_mesh: GameObject;
   	static var height: float;
    static var degree: float;
    static var degree2: float;
    static var normal: Vector3;
    static var hit: RaycastHit;
    static var splat: float[,,];
    static var splat_length: int;
    static var detail_length: int;
    static var detail: int[] = new int[32];
    static var detail1: int[,];
    static var heightmap_scale: Vector3;
    
    var tooltip_text: String;
    
    @MenuItem ("Terrain/Terrain Composer")
    
	static function ShowWindow() 
	{
        window = EditorWindow.GetWindow (TerrainComposer);
        window.title = "TerrainComp.";
    }
    
    static function Init () 
    {
        ScriptableObject.CreateInstance.<TerrainComposer>();
    }
    
    function OnEnable()
    {
    	disabled = false;
    	
    	if ((!TerrainComposer_Scene || !script) && !script_failed)
        {
        	Get_TerrainComposer_Scene();
        }
    	
    	var cb: EditorApplication.CallbackFunction = MyUpdate;
    	
    	EditorApplication.update = System.Delegate.Combine(cb,EditorApplication.update);
		
		set_all_image_import_settings();
		check_terrains();
		content_startup();
    } 	
    
    function content_startup()
    {
    	if (read_checked() != System.DateTime.Now.Day)
    	{
	    	if (read_check() > 0)
		    {
		    	check_content_version();
		    }
		}
    }
    
    function content_version()
    {
		var enc: Encoding = Encoding.Unicode;

		script.settings.contents = new WWW(enc.GetString(process_out(File.ReadAllBytes(Application.dataPath+"/TerrainComposer/templates/content2.dat"))));
    	script.settings.loading = 2;
	}
	
	function check_content_version()
	{
		var enc: Encoding = Encoding.Unicode;
		
		script.settings.contents = new WWW(enc.GetString(process_out(File.ReadAllBytes(Application.dataPath+"/TerrainComposer/templates/content1.dat"))));
    	script.settings.loading = 1;
	}
    
    function Get_TerrainComposer_Scene()
    {
     	TerrainComposer_Scene = GameObject.Find("TerrainComposer");
        var set_path: boolean = false;
        
        if (TerrainComposer_Scene)
        {
        	script = TerrainComposer_Scene.GetComponent(terraincomposer_save);
        	if (script)
        	{
        		script_set = true;
        		return; 
        	}
        }
        else {set_path = true;}
        
        load_terraincomposer("Assets/TerrainComposer/Templates/new_setup.prefab",false,false);
        
        if (!script || !TerrainComposer_Scene)
        {
        	script_set = false;
        	script_failed = true;
        	this.ShowNotification(GUIContent("File missing! Reinstall package..."));
        } 
        if (script.export_path.Length == 0){script.export_path = Application.dataPath;}
        if (script.terrain_path.Length == 0){script.terrain_path = Application.dataPath;}
    	
        this.Repaint();	
        
    }
    
    function OnDisable()
    {
    	script = null;
    	disabled = true;	
    	var cb: EditorApplication.CallbackFunction = MyUpdate;
		
		EditorApplication.update = System.Delegate.Remove(EditorApplication.update,cb);
	}
    
	function OnFocus()
	{
		if (!TerrainComposer_Scene){TerrainComposer_Scene = GameObject.Find("TerrainComposer");}
		if (TerrainComposer_Scene){script = TerrainComposer_Scene.GetComponent(terraincomposer_save);}
		
		set_paths();
		
		lost_focus = false;
    }
	
	function OnLostFocus()
	{
		lost_focus = true;
	}

    function OnGUI() 
    {
        if ((!TerrainComposer_Scene || !script) && !script_failed)
        {
        	Get_TerrainComposer_Scene();
        }
		
		key = Event.current;
      
		EditorGUILayout.BeginHorizontal();
        var rect: Rect;
        var menu: GenericMenu;
        if (GUILayout.Button("File",EditorStyles.toolbarButton,GUILayout.Width(55)))
        {
        	 rect = GUILayoutUtility.GetLastRect();
        	 rect.y += 18;
        	 menu = new GenericMenu ();                                
        	 menu.AddItem (new GUIContent ("New"), false, main_menu, "new");                
        	 menu.AddSeparator (""); 
        	 menu.AddItem (new GUIContent ("Open"), false, main_menu, "open");                
        	               
        	 menu.AddItem (new GUIContent ("Save"), false, main_menu, "save");                                
        	 menu.AddSeparator (""); 
        	 menu.AddItem (new GUIContent ("Close"), false, main_menu, "close");  
        	 menu.DropDown (rect);
        }
        if (GUILayout.Button("Edit",EditorStyles.toolbarButton,GUILayout.Width(55)))
        {
        	 rect = GUILayoutUtility.GetLastRect();
        	 rect.y += 18;
        	 rect.x += 55;
        	 menu = new GenericMenu ();                                
        	 menu.AddItem (new GUIContent("Undo"),false,main_menu,"undo");  
        	 menu.AddItem (new GUIContent("Redo"),false,main_menu,"redo");
        	 menu.DropDown (rect);              
        }
        if (GUILayout.Button("Tools",EditorStyles.toolbarButton,GUILayout.Width(55)))
        {
        	 rect = GUILayoutUtility.GetLastRect();
        	 rect.y += 18;
        	 rect.x += 110;
        	 menu = new GenericMenu ();                                
        	 menu.AddItem (new GUIContent("Measure Tool"),script.measure_tool, main_menu, "measure_tool");  
        	 menu.AddSeparator (""); 
        	 menu.AddItem (new GUIContent("Quick Tools"),script.quick_tools, main_menu, "quick_tools");  
        	 menu.AddSeparator (""); 
        	 menu.AddItem (new GUIContent("Mesh Capture Tool"),script.meshcapture_tool, main_menu, "meshcapture_tool"); 
        	 menu.AddSeparator (""); 
        	 menu.AddItem (new GUIContent("Image Filter Tool"),false,main_menu,"texture_tool");
        	 menu.AddItem (new GUIContent("Image Pattern Tool"),false,main_menu,"pattern_tool");             
        	 menu.AddItem (new GUIContent("Image Heigtmap Tool"),false,main_menu,"heightmap_tool");
        	 menu.DropDown (rect);
        }
        if (GUILayout.Button("Options",EditorStyles.toolbarButton,GUILayout.Width(55)))
        {
        	 rect = GUILayoutUtility.GetLastRect();
        	 rect.y += 18;
        	 rect.x += 165;
        	 menu = new GenericMenu ();                                
        	 menu.AddItem (new GUIContent("Color Layout Scheme"),script.settings.color_scheme_display,main_menu,"color_scheme_display");   
        	 menu.AddSeparator("");
        	 menu.AddItem (new GUIContent("Generate Settings"),script.generate_settings,main_menu,"generate_settings"); 
        	 menu.AddItem (new GUIContent("Terrain Max Settings"),script.settings.terrain_settings,main_menu,"terrain_settings");
        	 menu.AddSeparator("");
        	 menu.AddItem (new GUIContent("Database Restore"),script.settings.database_display,main_menu,"database_restore"); 
        	 menu.DropDown (rect);
        }
        if (GUILayout.Button("View",EditorStyles.toolbarButton,GUILayout.Width(55)))
        {
        	 rect = GUILayoutUtility.GetLastRect();
        	 rect.y += 18;
        	 rect.x += 220;
        	 
        	 menu = new GenericMenu (); 
        	
        	 menu.AddItem (new GUIContent("Layer Count"),script.layer_count,main_menu,"layer_count"); 
        	 menu.AddItem (new GUIContent("Placed Count"),script.placed_count,main_menu,"placed_count");
        	 menu.AddSeparator (""); 
        	 menu.AddItem (new GUIContent("Generate On Top"),script.generate_on_top,main_menu,"generate_dock"); 
        	 menu.AddSeparator (""); 
        	 menu.AddItem (new GUIContent("Remarks"),script.settings.remarks,main_menu,"remarks");  
        	 menu.AddSeparator (""); 
        	 menu.AddItem (new GUIContent("Layer Groups"),script.description_display,main_menu,"description_display");  
        	 menu.AddItem (new GUIContent("Project Info"),script.settings.display_filename,main_menu,"project_info");  
        	 menu.AddSeparator (""); 
        	 menu.AddItem (new GUIContent("Colors"), script.settings.color_scheme, main_menu,"color_scheme");                
        	 menu.AddItem (new GUIContent("Color Curves"), script.settings.display_color_curves,main_menu, "color_curves");
        	 menu.AddItem (new GUIContent("Mix Curves"), script.settings.display_mix_curves,main_menu, "mix_curves");
        	 menu.AddItem (new GUIContent("Box"), script.settings.box_scheme,main_menu, "box_scheme");
        	 menu.AddSeparator (""); 
        	 menu.AddItem (new GUIContent("Filter Select Text"),script.settings.filter_select_text,main_menu, "filter_select_text");
        	 if (Application.platform == RuntimePlatform.OSXEditor)
        	 {
        	 	menu.AddItem (new GUIContent("Toggle Long Text"),script.settings.toggle_text_long, main_menu, "long_toggle_text");
        	 	menu.AddItem (new GUIContent("Toggle Short Text"),!script.settings.toggle_text_long, main_menu, "short_toggle_text");
        		menu.AddItem (new GUIContent("Toggle No Text"),!script.settings.toggle_text, main_menu, "no_toggle_text");
        	 }
        	 else
        	 {
        	 	menu.AddItem (new GUIContent("Toggle Text/Long Text"),script.settings.toggle_text_long, main_menu, "long_toggle_text");
        	 	menu.AddItem (new GUIContent("Toggle Text/Short Text"),script.settings.toggle_text_short, main_menu, "short_toggle_text");
        	 	menu.AddSeparator ("Toggle Text/"); 
        	 	menu.AddItem (new GUIContent("Toggle Text/No Text"),script.settings.toggle_text_no, main_menu, "no_toggle_text");
        	 }
        	 menu.DropDown (rect);
        }
        
        if (GUILayout.Button("Help",EditorStyles.toolbarButton,GUILayout.Width(55)))
        {
        	 rect = GUILayoutUtility.GetLastRect();
        	 rect.y += 18;
        	 rect.x += 275;
        	 
        	 menu = new GenericMenu (); 
        	
        	 menu.AddItem (new GUIContent("About..."),false,main_menu,"terraincomposer_info");
        	 menu.AddSeparator (""); 
        	 menu.AddItem (new GUIContent("Update..."),false,main_menu,"update");
        	 menu.AddSeparator (""); 
        	 if (Application.platform == RuntimePlatform.OSXEditor)
        	 {
        	 	menu.AddItem (new GUIContent("Tooltip Long Text"),script.settings.toggle_text_long, main_menu, "long_tooltip_text");
        	 	menu.AddItem (new GUIContent("Tooltip Short Text"),!script.settings.toggle_text_long, main_menu, "short_tooltip_text");
        	 	menu.AddItem (new GUIContent("Tooltip No Text"),!script.settings.toggle_text, main_menu, "no_tooltip_text");
        	 }
        	 else
        	 {
        	 	menu.AddItem (new GUIContent("Tooltip Text/Long Text"),script.settings.tooltip_text_long, main_menu, "long_tooltip_text");
        	 	menu.AddItem (new GUIContent("Tooltip Text/Short Text"),script.settings.tooltip_text_short, main_menu, "short_tooltip_text");
        	 	menu.AddSeparator("Tooltip Text/"); 
        	 	menu.AddItem (new GUIContent("Tooltip Text/No Text"),script.settings.tooltip_text_no, main_menu, "no_tooltip_text");
        	 }
        	 menu.DropDown (rect);
        }
		if (script.settings.display_filename)
		{        
	        if (script.filename == String.Empty){EditorGUILayout.LabelField(" <New Project>");}
	        	else {EditorGUILayout.LabelField(" <"+script.filename+">");}
	    }
	    EditorGUILayout.EndHorizontal();
        
        if (new_window)
        {
        	EditorGUILayout.BeginHorizontal();
        	EditorGUILayout.LabelField("All layer content will be lost. Are you sure?");
        	if (GUILayout.Button("Yes",GUILayout.Width(40)))
        	{
        		new_description = false;
	        	script.new_layers();
        		new_window = false;
        	}
        	if (GUILayout.Button("No",GUILayout.Width(40)))
        	{
        		new_window = false;
        	}	
        	EditorGUILayout.EndHorizontal();
        }
        GUILayout.Space(5);
        
        EditorGUILayout.BeginHorizontal();
        if (button6_texture)
        {
        	if (script.heightmap_output){GUI.backgroundColor = Color(0,1,0,1);}
        	if (script.settings.tooltip_mode != 0)
        	{
        		tooltip_text = "Heightmap Output";
        	}
        	if (script.settings.tooltip_mode == 2)
        	{
        		tooltip_text += "\n\n(Shift Click to Fold/Unfold Heightmap Layers)";
        	}
        	if (GUILayout.Button(GUIContent(button6_texture,tooltip_text),GUILayout.Width(52),GUILayout.Height(32)))
        	{
        		if (key.shift)
        		{
        			script.layer_heightmap_foldout = !script.layer_heightmap_foldout;
        			if (script.layer_heightmap_foldout){script.loop_prelayer("(fl)(heightmap)(true)",0,true);} else {script.loop_prelayer("(fl)(heightmap)(false)",0,true);}
        		}
        		else
        		{
        			script.heightmap_output = !script.heightmap_output;
        			if (script.heightmap_output)
        			{
        				script.color_output = false;
        				script.splat_output = false;
        				script.tree_output = false;
        				script.grass_output = false;
        				script.object_output = false;
        				
        				if(!script.meshcapture_tool)
        				{
        					if (script.button_export){script.button_generate_text = "Export .Raw";}
        				}
        				else
        				{
        					if (script.button_export){script.button_generate_text = "Export .Png";}
        				}
        			}
        		}
        	}
        	if (script.heightmap_output){GUI.backgroundColor = Color.white;}
        }
        if (button0_texture)
        {
        	if (script.color_output){GUI.backgroundColor = Color(0,1,0,1);}
        	if (script.settings.tooltip_mode != 0)
        	{
        		tooltip_text = "Colormap Output";
        	}
        	if (script.settings.tooltip_mode == 2)
        	{
        		tooltip_text += "\n\n(Shift Click to Fold/Unfold Color Layers)";
        	}
        	if (GUILayout.Button(GUIContent(button0_texture,tooltip_text),GUILayout.Width(52),GUILayout.Height(32)))
        	{
        		if (key.shift)
        		{
        			script.layer_color_foldout = !script.layer_color_foldout;
        			if (script.layer_color_foldout){script.loop_prelayer("(fl)(color)(true)",0,true);} else {script.loop_prelayer("(fl)(color)(false)",0,true);}
        		}
        		else
        		{
        			script.color_output = !script.color_output;
        			if (script.color_output)
        			{
        				if (!script.heightmap_output && script.button_export){script.button_generate_text = "Export .Png";}
        				script.splat_output = false;
        				
        				init_color_splat_textures();
        				script.check_synchronous_terrains_color_textures();
        				script.heightmap_output = false;
        			}
        		}
        	}
        	if (script.color_output){GUI.backgroundColor = Color.white;}
        }
        if (button1_texture)
        {
        	if (script.splat_output){GUI.backgroundColor = Color(0,1,0,1);}
        	if (script.settings.tooltip_mode != 0)
        	{
        		tooltip_text = "Splat Output";
        	}
        	if (script.settings.tooltip_mode == 2)
        	{
        		tooltip_text += "\n\n(Shift Click to Fold/Unfold Splat Layers)";
        	}
        	if(GUILayout.Button(GUIContent(button1_texture,tooltip_text),GUILayout.Width(52),GUILayout.Height(32)))
        	{
        		if (key.shift)
        		{
        			script.layer_splat_foldout = !script.layer_splat_foldout;
        			if (script.layer_splat_foldout){script.loop_prelayer("(fl)(splat)(true)",0,true);} else {script.loop_prelayer("(fl)(splat)(false)",0,true);}
        		}
        		else
        		{
        			script.splat_output = !script.splat_output;
        			if (script.splat_output)
        			{
        				if (!script.heightmap_output && script.button_export){script.button_generate_text = "Export .Png";}
        				script.color_output = false;
        				script.check_synchronous_terrains_splat_textures();
        				script.heightmap_output = false;
        			}
        		}
         	}
         	if (script.splat_output){GUI.backgroundColor = Color.white;}
        }
        if (button2_texture)
        {
        	if (script.tree_output){GUI.backgroundColor = Color(0,1,0,1);}
        	if (script.settings.tooltip_mode != 0)
        	{
        		tooltip_text = "Tree Output";
        	}
        	if (script.settings.tooltip_mode == 2)
        	{
        		tooltip_text += "\n\n(Shift Click to Fold/Unfold Tree Layers)";
        	}
        	if (GUILayout.Button(GUIContent(button2_texture,tooltip_text),GUILayout.Width(52),GUILayout.Height(32)))
        	{
        		if (key.shift)
        		{
        			script.layer_tree_foldout = !script.layer_tree_foldout;
        			if (script.layer_tree_foldout){script.loop_prelayer("(fl)(tree)(true)",0,true);} else {script.loop_prelayer("(fl)(tree)(false)",0,true);}
        		}
        		else
        		{
        			script.tree_output = !script.tree_output;
        			if (script.tree_output){script.heightmap_output = false;}
        		}
        	}
        	if (script.tree_output){GUI.backgroundColor = Color.white;}
        }
        if (button3_texture)
        {
        	if (script.grass_output){GUI.backgroundColor = Color(0,1,0,1);}
        	if (script.settings.tooltip_mode != 0)
        	{
        		tooltip_text = "Grass/Detail Output";
        	}
        	if (script.settings.tooltip_mode == 2)
        	{
        		tooltip_text += "\n\n(Shift Click to Fold/Unfold Grass/Detail Layers)";
        	}
        	if (GUILayout.Button(GUIContent(button3_texture,tooltip_text),GUILayout.Width(52),GUILayout.Height(32)))
        	{
        		if (key.shift)
        		{
        			script.layer_grass_foldout = !script.layer_grass_foldout;
        			if (script.layer_grass_foldout){script.loop_prelayer("(fl)(grass)(true)",0,true);} else {script.loop_prelayer("(fl)(grass)(false)",0,true);}
        		}
        		else
        		{
        			script.grass_output = !script.grass_output;
        			if (script.grass_output){script.heightmap_output = false;}
        		}
        	}
        	if (script.grass_output){GUI.backgroundColor = Color.white;}
        }
        if (button4_texture)
        {
        	if (script.object_output){GUI.backgroundColor = Color(0,1,0,1);}
        	if (script.settings.tooltip_mode != 0)
        	{
        		tooltip_text = "Object Output";
        	}
        	if (script.settings.tooltip_mode == 2)
        	{
        		tooltip_text += "\n\n(Shift Click to Fold/Unfold Object Layers)";
        	}
        	if (GUILayout.Button(GUIContent(button4_texture,tooltip_text),GUILayout.Width(52),GUILayout.Height(32)))
        	{
        		if (key.shift)
        		{
        			script.layer_object_foldout = !script.layer_object_foldout;
        			if (script.layer_object_foldout){script.loop_prelayer("(fl)(object)(true)",0,true);} else {script.loop_prelayer("(fl)(object)(false)",0,true);}
        		}
        		else
        		{
        			script.object_output = !script.object_output;
        			if (script.object_output){script.heightmap_output = false;}
        		}
        	}
        	if (script.object_output){GUI.backgroundColor = Color.white;}
        }
        if (button5_texture)
        {
        	if (script.button_export){GUI.backgroundColor = Color(0,1,0,1);}
        	if (script.settings.tooltip_mode != 0)
        	{
        		tooltip_text = "Export Output to Image";
        	}
          	if(GUILayout.Button(GUIContent(button5_texture,tooltip_text),GUILayout.Width(52),GUILayout.Height(32)))
        	{
        		if (!script2)
        		{
	        		script.button_export = !script.button_export;
	        		
	        		if (script.button_export)
	        		{
	        			if (script.heightmap_output && !script.meshcapture_tool){script.button_generate_text = "Export .Raw";}
	        			else
	        			{
	        				script.button_generate_text = "Export .Png";
	        			}
	        		}
	        		else 
	        		{
	        			if (script.meshcapture_tool){script.meshcapture_tool = false;}
	        			if (!script.slice_tool_active){script.button_generate_text = "Generate";} else {script.button_generate_text = "Slice";}
	        		}
	        		button5 = false;
	        	}
	        	else
	        	{
	        		this.ShowNotification(GUIContent("Cannot active Export Button while generating"));
	        	}
        	}
        	if (script.button_export){GUI.backgroundColor = Color.white;}
        }
        if (button8_texture)
        {
        	if (script.measure_tool){GUI.backgroundColor = Color(0,1,0,1);}
        	if (script.settings.tooltip_mode != 0)
        	{
        		tooltip_text = "Measure Tool\n\n(Control Right Click in Scene view to lock/unlock the current reading)";
        	}
        	if(GUILayout.Button(GUIContent(button8_texture,tooltip_text),GUILayout.Width(52),GUILayout.Height(32)))
        	{
        		script.measure_tool = !script.measure_tool;
        		if (!script.measure_tool){script.measure_tool_active = false;}
        		if (script.measure_tool)
        		{
        			script.measure_tool_active = true;
        			if (script.measure_tool_undock){create_window_measure_tool();}
        		}
        	}
        	if (script.measure_tool){GUI.backgroundColor = Color.white;}
        }
        if (button9_texture)
        {
        	if (script.meshcapture_tool){GUI.backgroundColor = Color(0,1,0,1);}
        	if (script.settings.tooltip_mode != 0)
        	{
        		tooltip_text = "Mesh Capture Tool";
        	}
        	if(GUILayout.Button(GUIContent(button9_texture,tooltip_text),GUILayout.Width(52),GUILayout.Height(32)))
        	{
        		if (!script2)
        		{
	        		script.meshcapture_tool = !script.meshcapture_tool;
	        		script.button_export = script.meshcapture_tool;
	        		if (script.button_export){script.button_generate_text = "Export .PNG";}
	        			else {script.button_generate_text = "Generate";}
	        	}
	        	else
	        	{
	        		this.ShowNotification(GUIContent("Cannot activate the Mesh Capture Tool while generating"));
	        	}
        	}
        	if (script.meshcapture_tool){GUI.backgroundColor = Color.white;}
        }
        if (button7_texture)
        {
           	if (script.image_tools){GUI.backgroundColor = Color(0,1,0,1);}
        	if (script.settings.tooltip_mode != 0)
        	{
        		tooltip_text = "Texture Tool and Pattern Tool";
        	}
        	if(GUILayout.Button(GUIContent(button7_texture,tooltip_text),GUILayout.Width(52),GUILayout.Height(32)))
        	{
        		if (!script.image_tools)
        		{
	        		if (script.texture_tool.preimage.image.Count < 2)
		        	{
		        		for (var count_image: int = 0;count_image < 2-script.texture_tool.preimage.image.Count;++count_image)
		        		{
		        			script.texture_tool.preimage.image.Add(new Texture2D(1,1));
		        		}
		        	}
		        	this.Repaint();
		        	create_window_texture_tool();
		        }
		        else
		        {
		        	texture_tool = EditorWindow.GetWindow(FilterTexture);
		        	if (texture_tool){texture_tool.Close();}
		        	script.image_tools = false;
		        }
        	}
        	if (script.image_tools){GUI.backgroundColor = Color.white;}
        }
        EditorGUILayout.EndHorizontal();
        
        if (script.layer_count)
        {
	        EditorGUILayout.BeginHorizontal();
	        GUILayout.Space(20);
	        if (script.layer_heightmap < 10){GUILayout.Space(2);}
	        EditorGUILayout.LabelField("("+script.layer_heightmap+")",GUILayout.Width(40));
	        if (script.layer_heightmap > 9){GUILayout.Space(2);}
	        GUILayout.Space(9.5);
	        if (script.layer_color < 10){GUILayout.Space(2);}
	        EditorGUILayout.LabelField("("+script.layer_color+")",GUILayout.Width(40));
	        if (script.layer_color > 9){GUILayout.Space(2);}
	        GUILayout.Space(9.5);
	        if (script.layer_splat < 10){GUILayout.Space(2);}
	        EditorGUILayout.LabelField("("+script.layer_splat+")",GUILayout.Width(40));
	        if (script.layer_splat > 9){GUILayout.Space(2);}
	        GUILayout.Space(9.5);
	        if (script.layer_tree < 10){GUILayout.Space(2);}
	        EditorGUILayout.LabelField("("+script.layer_tree+")",GUILayout.Width(40));
	        if (script.layer_tree > 9){GUILayout.Space(2);}
	        GUILayout.Space(9.5);
	        if (script.layer_grass < 10){GUILayout.Space(2);}
	        EditorGUILayout.LabelField("("+script.layer_grass+")",GUILayout.Width(40));
	        if (script.layer_grass > 9){GUILayout.Space(2);}
	        GUILayout.Space(10);
	        EditorGUILayout.LabelField("("+script.layer_object+")",GUILayout.Width(40));
	        EditorGUILayout.EndHorizontal();
	    }
        
        EditorGUILayout.Space();
        
        var index: int = -1;
        var options: String[] = ["New","Open","Save"];
        var sizes: int[] = [1,2,3];
  
        Paint();
    }
	
	function Paint()
	{       
		tooltip_text = String.Empty;
		if (script.settings.update_display)
	    {
	    	EditorGUILayout.BeginHorizontal();
			EditorGUILayout.LabelField("Updates",GUILayout.Width(225));
			gui_changed_old = GUI.changed;
			GUI.changed = false;
			var update_select: int = read_check();
			update_select = EditorGUILayout.Popup(update_select,script.settings.update);	    	
			if (GUI.changed)
			{
				write_check(update_select.ToString());
			}
			GUI.changed = gui_changed_old;
	    	EditorGUILayout.EndHorizontal();
	    	
	    	EditorGUILayout.BeginHorizontal();
			EditorGUILayout.LabelField("Current TerrainComposer Version",GUILayout.Width(225));
			EditorGUILayout.LabelField("Final "+read_version().ToString("F3"),GUILayout.Width(80));
			EditorGUILayout.EndHorizontal();
			
			EditorGUILayout.BeginHorizontal();
			EditorGUILayout.LabelField("Available TerrainComposer Version",GUILayout.Width(225));
			if (script.settings.new_version == 0){EditorGUILayout.LabelField("---",GUILayout.Width(80));}
			else {EditorGUILayout.LabelField("Final "+script.settings.new_version.ToString("F3"),GUILayout.Width(80));}
			if (script.settings.loading == 1){EditorGUILayout.LabelField("Checking...");}
			if (script.settings.loading == 2){EditorGUILayout.LabelField("Downloading...");}
			
			if (script.settings.loading == 0 || script.settings.loading == 3)
			{
				if (!script.settings.update_version && !script.settings.update_version2)
				{
					if (GUILayout.Button("Check Now",GUILayout.Width(80)))
					{
						check_content_version();
					}
				}
			}
			if (script.settings.update_version && script.settings.loading == 0)
			{
				if (GUILayout.Button("Download",GUILayout.Width(80)))
				{
					content_version();
					script.settings.update_version = false;
				}
			}
			if (script.settings.update_version2)
			{
				if (GUILayout.Button("Import",GUILayout.Width(80)))
				{
					import_contents(Application.dataPath+"/TerrainComposer/Update/TerrainComposer.unitypackage",true);
				}
			}
			EditorGUILayout.EndHorizontal();
	    } 
	    if (script.settings.update_display2)
	    {
	    	EditorGUILayout.BeginHorizontal();
			
			EditorGUILayout.EndHorizontal();
	    	
	    }
        if (script.settings.database_display)
        {
	        EditorGUILayout.BeginHorizontal();
	        if (GUILayout.Button("Info Database",GUILayout.Width(120)))
	        {
	        	script.loop_prelayer("(inf)",0,true);
	        }
	        if (GUILayout.Button("<Fix Database>",GUILayout.Width(120)) && key.shift)
	        {
	        	Undo.RegisterUndo(script,"Fix Database");
	        	script.loop_prelayer("(fix)",0,true);
	        	script.loop_prelayer("(inf)",0,true);
	        }
	        if (GUILayout.Button("Reset Swap/Copy",GUILayout.Width(120)))
	        {
	        	if (!key.shift)
	        	{
	        		script.loop_prelayer("(rsc)",0,true);
	        		script.reset_swapcopy();
	        	}
	        	else
	        	{
	        		script.reset_paths();
	        		script.settings.new_version = 0;
	        	}
	        }
	        if (GUILayout.Button("<Update Version>",GUILayout.Width(120)))
	        {
	        	if (key.shift && key.control)
	        	{
	        		script.reset_software_version();
	        		convert_old_prelayer(script.prelayers[0],true,true);
	        	}
	        }
	        EditorGUILayout.EndHorizontal();
	       
	        EditorGUILayout.BeginHorizontal();
	        EditorGUILayout.LabelField("Actual Layer Levels: ",GUILayout.Width(150));
	        EditorGUILayout.LabelField(""+(script.prelayers.Count-1),GUILayout.Width(70));
	        EditorGUILayout.LabelField("Layer Levels Linked: ",GUILayout.Width(150));
	        EditorGUILayout.LabelField(""+script.settings.prelayers_linked);
	        EditorGUILayout.EndHorizontal();
	        
	        EditorGUILayout.BeginHorizontal();
	        EditorGUILayout.LabelField("Actual Filters: ",GUILayout.Width(150));
	        EditorGUILayout.LabelField(""+script.filter.Count,GUILayout.Width(70));
	        EditorGUILayout.LabelField("Filters Linked: ",GUILayout.Width(150));
	        EditorGUILayout.LabelField(""+script.settings.filters_linked);
	        EditorGUILayout.EndHorizontal();
	       
	        EditorGUILayout.BeginHorizontal();
	        EditorGUILayout.LabelField("Actual Subfilters: ",GUILayout.Width(150));
	        EditorGUILayout.LabelField(""+script.subfilter.Count,GUILayout.Width(70));
	        EditorGUILayout.LabelField("Subfilters Linked: ",GUILayout.Width(150));
	        EditorGUILayout.LabelField(""+script.settings.subfilters_linked);
	        EditorGUILayout.EndHorizontal();
	        
	        EditorGUILayout.BeginHorizontal();
	        EditorGUILayout.LabelField("Filter: ",GUILayout.Width(150));
	        script.settings.filter_foldout_index = EditorGUILayout.IntField(script.settings.filter_foldout_index,GUILayout.Width(70));
	        if (GUILayout.Button("Foldout",GUILayout.Width(60)))
	        {
	        	script.loop_prelayer("(ff)",script.settings.filter_foldout_index,true);
	        }
	        EditorGUILayout.EndHorizontal();
	        
	        EditorGUILayout.BeginHorizontal();
	        EditorGUILayout.LabelField("Subfilter: ",GUILayout.Width(150));
	        script.settings.subfilter_foldout_index = EditorGUILayout.IntField(script.settings.subfilter_foldout_index,GUILayout.Width(70));
	        if (GUILayout.Button("Foldout",GUILayout.Width(60)))
	        {
	        	script.loop_prelayer("(fs)",script.settings.subfilter_foldout_index,true);
	        }
	        EditorGUILayout.EndHorizontal();
	    }
	    
        if (script.generate_settings)
        {
        	EditorGUILayout.BeginHorizontal();
        	script.generate_settings_foldout = EditorGUILayout.Foldout(script.generate_settings_foldout,"Generate Settings");
        	EditorGUILayout.EndHorizontal();
       		
       		if (script.generate_settings_foldout)
       		{
       			EditorGUILayout.BeginHorizontal();
	        	GUILayout.Space(15);
	        	gui_changed_old = GUI.changed;
	        	GUI.changed = false;
	        	EditorGUILayout.LabelField("Generate Speed",GUILayout.Width(170));
	        	script.generate_step = EditorGUILayout.IntField(script.generate_step,GUILayout.Width(50));
	        	if (GUI.changed)
	        	{
	        		if (script.generate_step < 1){script.generate_step = 1;}
	        		if (script2){script2.generate_step = script.generate_step;}
	        	}
	        	GUI.changed = gui_changed_old;
	        	EditorGUILayout.EndHorizontal();
	        	
	       		EditorGUILayout.BeginHorizontal();
	        	GUILayout.Space(15);
	        	EditorGUILayout.LabelField("Object Place Speed",GUILayout.Width(170));
	        	gui_changed_old = GUI.changed;
	        	GUI.changed = false;
	        	script.break_x_step = EditorGUILayout.IntField(script.break_x_step,GUILayout.Width(50));
	        	if (GUI.changed)
	        	{
	        		if (script.break_x_step < 1){script.break_x_step = 1;}
	        		if (script2){script2.break_x_step = script.break_x_step;}
	        	}
	        	GUI.changed = gui_changed_old;
	        	EditorGUILayout.EndHorizontal();
	        	
	        	EditorGUILayout.BeginHorizontal();
	        	GUILayout.Space(15);
	        	EditorGUILayout.LabelField("Run in Background",GUILayout.Width(170));
	        	script.settings.run_in_background = EditorGUILayout.Toggle(script.settings.run_in_background,GUILayout.Width(25));
	        	EditorGUILayout.EndHorizontal();
	        	
	        	EditorGUILayout.BeginHorizontal();
	        	GUILayout.Space(15);
	        	EditorGUILayout.LabelField("Progressbar Auto Generate",GUILayout.Width(170));
	        	script.settings.display_bar_auto_generate = EditorGUILayout.Toggle(script.settings.display_bar_auto_generate,GUILayout.Width(25));
	        	EditorGUILayout.EndHorizontal();
	        	
	        	EditorGUILayout.BeginHorizontal();
	        	GUILayout.Space(15);
	        	EditorGUILayout.LabelField("Auto Fit Terrains",GUILayout.Width(170));
	        	script.settings.auto_fit_terrains = EditorGUILayout.Toggle(script.settings.auto_fit_terrains,GUILayout.Width(25));
	        	EditorGUILayout.EndHorizontal();
	        	
	        	EditorGUILayout.BeginHorizontal();
				GUILayout.Space(15);
				EditorGUILayout.LabelField("Angle Smoothing",GUILayout.Width(170));
				script.settings.smooth_angle = EditorGUILayout.Slider(script.settings.smooth_angle,1,100);	
				EditorGUILayout.EndHorizontal();
				
				EditorGUILayout.BeginHorizontal();
				GUILayout.Space(15);
				EditorGUILayout.LabelField("Angle Rounding",GUILayout.Width(170));
				script.settings.round_angle = EditorGUILayout.Slider(script.settings.round_angle,0,100);	
				EditorGUILayout.EndHorizontal();
				
				EditorGUILayout.BeginHorizontal();
	        	GUILayout.Space(15);
	        	EditorGUILayout.LabelField("Grass Density",GUILayout.Width(170));
	        	gui_changed_old = GUI.changed;
	        	GUI.changed = false;
	        	script.settings.grass_density = EditorGUILayout.FloatField(script.settings.grass_density,GUILayout.Width(50));
	        	if (GUI.changed)
	        	{
	        		if (script.settings.grass_density < 0){script.settings.grass_density = 0;}
	        		if (script.settings.grass_density > 255){script.settings.grass_density = 255;}
	        	}
	        	GUI.changed = gui_changed_old;
	        	EditorGUILayout.EndHorizontal();
				
				EditorGUILayout.BeginHorizontal();
				GUILayout.Space(15);
				EditorGUILayout.LabelField("Equal Density Resolution",GUILayout.Width(170));
				script.settings.resolution_density = EditorGUILayout.Toggle(script.settings.resolution_density,GUILayout.Width(25));	
				EditorGUILayout.EndHorizontal();
				
				if (script.settings.resolution_density)
				{
					/*EditorGUILayout.BeginHorizontal();
		        	GUILayout.Space(15);
		        	EditorGUILayout.LabelField("Density Resolution Max",GUILayout.Width(170));
		        	gui_changed_old = GUI.changed;
		        	GUI.changed = false;
		        	script.settings.resolution_density_max = EditorGUILayout.IntField(script.settings.resolution_density_max,GUILayout.Width(50));
		        	EditorGUILayout.EndHorizontal();*/
				
					EditorGUILayout.BeginHorizontal();
		        	GUILayout.Space(15);
		        	EditorGUILayout.LabelField("Density Resolution Min",GUILayout.Width(170));
		        	script.settings.resolution_density_min = EditorGUILayout.IntField(script.settings.resolution_density_min,GUILayout.Width(50));
		        	if (GUI.changed)
		        	{
		        		if (script.settings.resolution_density_min < 8){script.settings.resolution_density_min = 8;}
		        		script.settings.resolution_density_conversion = (1.0/(script.settings.resolution_density_min*1.0));
		        	}
		        	GUI.changed = gui_changed_old;
		        	EditorGUILayout.EndHorizontal();
				}
				
	        	EditorGUILayout.BeginHorizontal();
	        	GUILayout.Space(15);
	        	EditorGUILayout.LabelField("Unload Textures",GUILayout.Width(170));
	        	script.unload_textures = EditorGUILayout.Toggle(script.unload_textures,GUILayout.Width(25));
	        	EditorGUILayout.EndHorizontal();
	        	
	        	EditorGUILayout.BeginHorizontal();
	        	GUILayout.Space(15);
	        	EditorGUILayout.LabelField("Clean Memory",GUILayout.Width(170));
	        	script.clean_memory = EditorGUILayout.Toggle(script.clean_memory,GUILayout.Width(25));
	        	EditorGUILayout.EndHorizontal();
			}
		}        
		
		if (script.settings.terrain_settings)
        {
        	EditorGUILayout.BeginHorizontal();
        	script.settings.terrain_settings_foldout = EditorGUILayout.Foldout(script.settings.terrain_settings_foldout,"Terrain Max Settings");
        	EditorGUILayout.EndHorizontal();
       		
       		if (script.settings.terrain_settings_foldout)
       		{
       			EditorGUILayout.BeginHorizontal();
		        GUILayout.Space(15);
		        if (script.settings.settings_editor){GUI.backgroundColor = Color.green;}
		        if (GUILayout.Button("Editor",EditorStyles.miniButtonMid,GUILayout.Width(70)))
		        {
		        	script.settings.settings_editor = true;
		        	script.settings.settings_runtime = false;
		        }
		        GUI.backgroundColor = Color.white;
		        if (script.settings.settings_runtime){GUI.backgroundColor = Color.green;}
		        if (GUILayout.Button("Runtime",EditorStyles.miniButtonMid,GUILayout.Width(70)))
		        {
		        	script.settings.settings_editor = false;
		        	script.settings.settings_runtime = true;
		        }
		        GUI.backgroundColor = Color.white;
		        EditorGUILayout.EndHorizontal();
       			
       			EditorGUILayout.BeginHorizontal();
	        	GUILayout.Space(15);
	        	gui_changed_old = GUI.changed;
	        	GUI.changed = false;
	        	EditorGUILayout.LabelField("Basemap Distance",GUILayout.Width(170));
	        	if (script.settings.settings_editor){script.settings.editor_basemap_distance_max = EditorGUILayout.IntField(script.settings.editor_basemap_distance_max,GUILayout.Width(64));}
	        		else {script.settings.runtime_basemap_distance_max = EditorGUILayout.IntField(script.settings.runtime_basemap_distance_max,GUILayout.Width(64));}
	        	if (GUI.changed)
	        	{
	        		if (script.settings.editor_basemap_distance_max < 0){script.settings.editor_basemap_distance_max = 0;}
	        		if (script.settings.runtime_basemap_distance_max < 0){script.settings.runtime_basemap_distance_max = 0;}
	        	}
	        	GUI.changed = gui_changed_old;
	        	EditorGUILayout.EndHorizontal();
	        	
	        	EditorGUILayout.BeginHorizontal();
	        	GUILayout.Space(15);
	        	gui_changed_old = GUI.changed;
	        	GUI.changed = false;
	        	EditorGUILayout.LabelField("Detail Distance",GUILayout.Width(170));
	        	if (script.settings.settings_editor){script.settings.editor_detail_distance_max = EditorGUILayout.IntField(script.settings.editor_detail_distance_max,GUILayout.Width(64));}
	        		else {script.settings.runtime_detail_distance_max = EditorGUILayout.IntField(script.settings.runtime_detail_distance_max,GUILayout.Width(64));}
	        	if (GUI.changed)
	        	{
	        		if (script.settings.editor_detail_distance_max < 0){script.settings.editor_detail_distance_max = 0;}
	        		if (script.settings.runtime_detail_distance_max < 0){script.settings.runtime_detail_distance_max = 0;}
	        	}
	        	GUI.changed = gui_changed_old;
	        	EditorGUILayout.EndHorizontal();
	        	
	        	EditorGUILayout.BeginHorizontal();
	        	GUILayout.Space(15);
	        	gui_changed_old = GUI.changed;
	        	GUI.changed = false;
	        	EditorGUILayout.LabelField("Tree Distance",GUILayout.Width(170));
	        	if (script.settings.settings_editor){script.settings.editor_tree_distance_max = EditorGUILayout.IntField(script.settings.editor_tree_distance_max,GUILayout.Width(64));}
	        	else {script.settings.runtime_tree_distance_max = EditorGUILayout.IntField(script.settings.runtime_tree_distance_max,GUILayout.Width(64));}
	        	if (GUI.changed)
	        	{
	        		if (script.settings.editor_tree_distance_max < 0){script.settings.editor_tree_distance_max = 0;}
	        		if (script.settings.runtime_tree_distance_max < 0){script.settings.runtime_tree_distance_max = 0;}
	        	}
	        	GUI.changed = gui_changed_old;
	        	EditorGUILayout.EndHorizontal();
	        	
	        	EditorGUILayout.BeginHorizontal();
	        	GUILayout.Space(15);
	        	gui_changed_old = GUI.changed;
	        	GUI.changed = false;
	        	EditorGUILayout.LabelField("Tree Fade Length",GUILayout.Width(170));
	        	if (script.settings.settings_editor){script.settings.editor_fade_length_max = EditorGUILayout.IntField(script.settings.editor_fade_length_max,GUILayout.Width(64));}
	        		else {script.settings.runtime_fade_length_max = EditorGUILayout.IntField(script.settings.runtime_fade_length_max,GUILayout.Width(64));}
	        	if (GUI.changed)
	        	{
	        		if (script.settings.editor_fade_length_max < 0){script.settings.editor_fade_length_max = 0;}
	        		if (script.settings.runtime_fade_length_max < 0){script.settings.runtime_fade_length_max = 0;}
	        	}
	        	GUI.changed = gui_changed_old;
	        	EditorGUILayout.EndHorizontal();
	        	
	        	EditorGUILayout.BeginHorizontal();
	        	GUILayout.Space(15);
	        	gui_changed_old = GUI.changed;
	        	GUI.changed = false;
	        	EditorGUILayout.LabelField("Mesh Trees",GUILayout.Width(170));
	        	if (script.settings.settings_editor){script.settings.editor_mesh_trees_max = EditorGUILayout.IntField(script.settings.editor_mesh_trees_max,GUILayout.Width(64));}
	        		else {script.settings.runtime_mesh_trees_max = EditorGUILayout.IntField(script.settings.runtime_mesh_trees_max,GUILayout.Width(64));}
	        	if (GUI.changed)
	        	{
	        		if (script.settings.editor_mesh_trees_max < 0){script.settings.editor_mesh_trees_max = 0;}
	        		if (script.settings.runtime_mesh_trees_max < 0){script.settings.runtime_mesh_trees_max = 0;}
	        	}
	        	GUI.changed = gui_changed_old;
	        	EditorGUILayout.EndHorizontal();
	        	
	        	GUILayout.Space(10);
	        	EditorGUILayout.BeginHorizontal();
	        	GUILayout.Space(15);
	        	gui_changed_old = GUI.changed;
	        	GUI.changed = false;
	        	EditorGUILayout.LabelField("Max Terrain Tiles",GUILayout.Width(170));
	        	script.settings.terrain_tiles_max = EditorGUILayout.IntField(script.settings.terrain_tiles_max,GUILayout.Width(64));
	        	if (GUI.changed)
	        	{
	        		if (script.settings.terrain_tiles_max < 1){script.settings.terrain_tiles_max = 1;}
	        	}
	        	GUI.changed = gui_changed_old;
	        	EditorGUILayout.EndHorizontal();
	        }
	    }
	        
		if (script.settings.color_scheme_display)
        {
        	EditorGUILayout.BeginHorizontal();
        	script.settings.color_scheme_display_foldout = EditorGUILayout.Foldout(script.settings.color_scheme_display_foldout,"Color Layout Scheme");
        	EditorGUILayout.EndHorizontal();
       		
       		if (script.settings.color_scheme_display_foldout)
       		{
       			EditorGUILayout.BeginHorizontal();
	        	GUILayout.Space(15);
	        	EditorGUILayout.LabelField("Terrain Color",GUILayout.Width(190));
	        	script.settings.color.color_terrain = EditorGUILayout.ColorField(script.settings.color.color_terrain,GUILayout.Width(150));
	        	EditorGUILayout.EndHorizontal();
	        	
       			EditorGUILayout.BeginHorizontal();
	        	GUILayout.Space(15);
	        	EditorGUILayout.LabelField("Layer Group Color",GUILayout.Width(190));
	        	script.settings.color.color_description = EditorGUILayout.ColorField(script.settings.color.color_description,GUILayout.Width(150));
	        	EditorGUILayout.EndHorizontal();
	        	
	       		EditorGUILayout.BeginHorizontal();
	        	GUILayout.Space(15);
	        	EditorGUILayout.LabelField("Layer Color",GUILayout.Width(190));
	        	script.settings.color.color_layer = EditorGUILayout.ColorField(script.settings.color.color_layer,GUILayout.Width(150));
	        	EditorGUILayout.EndHorizontal();
	        	
	        	EditorGUILayout.BeginHorizontal();
	        	GUILayout.Space(15);
	        	EditorGUILayout.LabelField("Filter Color",GUILayout.Width(190));
	        	script.settings.color.color_filter = EditorGUILayout.ColorField(script.settings.color.color_filter,GUILayout.Width(150));
	        	EditorGUILayout.EndHorizontal();
	        	
	        	EditorGUILayout.BeginHorizontal();
	        	GUILayout.Space(15);
	        	EditorGUILayout.LabelField("Subfilter Color",GUILayout.Width(190));
	        	script.settings.color.color_subfilter = EditorGUILayout.ColorField(script.settings.color.color_subfilter,GUILayout.Width(150));
	        	EditorGUILayout.EndHorizontal();
	        	
	        	EditorGUILayout.BeginHorizontal();
	        	GUILayout.Space(15);
	        	EditorGUILayout.LabelField("Colormap Color",GUILayout.Width(190));
	        	script.settings.color.color_colormap = EditorGUILayout.ColorField(script.settings.color.color_colormap,GUILayout.Width(150));
	        	EditorGUILayout.EndHorizontal();
	        	
	        	EditorGUILayout.BeginHorizontal();
	        	GUILayout.Space(15);
	        	EditorGUILayout.LabelField("Splatmap Color",GUILayout.Width(190));
	        	script.settings.color.color_splat = EditorGUILayout.ColorField(script.settings.color.color_splat,GUILayout.Width(150));
	        	EditorGUILayout.EndHorizontal();
	        	
	        	EditorGUILayout.BeginHorizontal();
	        	GUILayout.Space(15);
	        	EditorGUILayout.LabelField("Tree Color",GUILayout.Width(190));
	        	script.settings.color.color_tree = EditorGUILayout.ColorField(script.settings.color.color_tree,GUILayout.Width(150));
	        	EditorGUILayout.EndHorizontal();
	        	
	        	EditorGUILayout.BeginHorizontal();
	        	GUILayout.Space(15);
	        	EditorGUILayout.LabelField("Tree Color Group",GUILayout.Width(190));
	        	script.settings.color.color_tree_precolor_range = EditorGUILayout.ColorField(script.settings.color.color_tree_precolor_range,GUILayout.Width(150));
	        	EditorGUILayout.EndHorizontal();
	        	
	        	EditorGUILayout.BeginHorizontal();
	        	GUILayout.Space(15);
	        	EditorGUILayout.LabelField("Tree Filter Color",GUILayout.Width(190));
	        	script.settings.color.color_tree_filter = EditorGUILayout.ColorField(script.settings.color.color_tree_filter,GUILayout.Width(150));
	        	EditorGUILayout.EndHorizontal();
	        	
	        	EditorGUILayout.BeginHorizontal();
	        	GUILayout.Space(15);
	        	EditorGUILayout.LabelField("Tree Subfilter Color",GUILayout.Width(190));
	        	script.settings.color.color_tree_subfilter = EditorGUILayout.ColorField(script.settings.color.color_tree_subfilter,GUILayout.Width(150));
	        	EditorGUILayout.EndHorizontal();
	        	
	        	EditorGUILayout.BeginHorizontal();
	        	GUILayout.Space(15);
	        	EditorGUILayout.LabelField("Grass Color",GUILayout.Width(190));
	        	script.settings.color.color_grass = EditorGUILayout.ColorField(script.settings.color.color_grass,GUILayout.Width(150));
	        	EditorGUILayout.EndHorizontal();
	        	
	        	EditorGUILayout.BeginHorizontal();
	        	GUILayout.Space(15);
	        	EditorGUILayout.LabelField("Object Color",GUILayout.Width(190));
	        	script.settings.color.color_object = EditorGUILayout.ColorField(script.settings.color.color_object,GUILayout.Width(150));
	        	EditorGUILayout.EndHorizontal();
	        	
	        	EditorGUILayout.BeginHorizontal();
	        	GUILayout.Space(15);
	        	if (GUILayout.Button("<Default>",GUILayout.Width(85)) && key.shift){script.settings.color = new color_settings_class();}
	        	if (GUILayout.Button("<Save as Default>",GUILayout.Width(130)) && key.shift){save_color_layout();}
	        	
	        	EditorGUILayout.EndHorizontal();
			}
		}    
		
		if (key.type == EventType.Repaint) 
		{
        		script.settings.top_rect = GUILayoutUtility.GetLastRect();
        		script.settings.top_height = script.settings.top_rect.y+script.settings.top_rect.height;
        }
        
        scrollPos = EditorGUILayout.BeginScrollView(scrollPos,GUILayout.Width(Screen.width),GUILayout.Height(0));
        
        if (script.measure_tool)
        {
        	if (!script.measure_tool_undock){draw_measure_tool();}
        }
        
		script.terrains_foldout = EditorGUILayout.Foldout (script.terrains_foldout,script.terrain_text);
    
        // terrain foldout
 		if (script.terrains_foldout)
	    {
	        var color_terrain: Color;
	        if (script.settings.color_scheme){color_terrain = script.settings.color.color_terrain;} else {color_terrain = Color.white;}
	        EditorGUILayout.BeginHorizontal();
	        GUILayout.Space(15);
	        
	        // add terrain
        	if (script.settings.tooltip_mode != 0)
        	{
        		tooltip_text = "Add a new Terrain";
        	}
        	if (GUILayout.Button(GUIContent("+",tooltip_text),GUILayout.Width(25))){script.set_terrain_length(script.terrains.Count+1);}
        	
        	// erase terrain
        	if (script.settings.tooltip_mode != 0)
        	{
        		tooltip_text = "Erase the last Terrain\n(Control Click)\n\nClear Terrain List\n(Control Shift Click)";
        	}
        	if (GUILayout.Button(GUIContent("-",tooltip_text),GUILayout.Width(25)) && script.terrains.Count > 1 && key.control)
        	{
        		Undo.RegisterUndo(script,"Terrain Erase");
	    		if (!key.shift)
	    		{
	    			script.set_terrain_length(script.terrains.Count-1);
	    		}
	    		else
	    		{
	    			script.clear_terrains();
	    		}
        	}
        	
        	if (script.settings.tooltip_mode != 0)
        	{
        		tooltip_text = "Auto Search Terrains from The Scene\n(Shift Click)";
        	}
        	if (GUILayout.Button(GUIContent("<Search>",tooltip_text),GUILayout.Width(75)) && key.shift)
        	{
        		script.set_auto_terrain();
        		script.reset_terrains_tiles(script);
        		assign_all_terrain_splat_alpha();
        	}
        	
        	if (script.settings.tooltip_mode != 0)
        	{
        		tooltip_text = "Fold/Unfold all Terrains\n(Click)\n\nInvert Foldout all Terrains\n(Shift Click)";
        	}
        	if (GUILayout.Button(GUIContent("F",tooltip_text),GUILayout.Width(20)))
        	{
        		script.terrains_foldout2 = !script.terrains_foldout2;
        		script.change_terrains_foldout(key.shift);
        	}
        	
        	if (script.settings.tooltip_mode != 0)
        	{
        		tooltip_text = "Activate/Deactivate all Terrains\n(Click)\n\nInvert Activation all Terrains\n(Shift Click)";
        	}
        	if (GUILayout.Button(GUIContent("A",tooltip_text),GUILayout.Width(20)))
        	{
        		script.terrains_active = !script.terrains_active;
        		script.change_terrains_active(key.shift);
        	}
        	
        	if (script.settings.tooltip_mode != 0)
        	{
        		tooltip_text = "Activate/Deactivate short Terrain List display\n(Click)";
        	}
        	if (script.settings.display_short_terrain){GUI.backgroundColor = Color.green;}
        	if (GUILayout.Button(GUIContent("I",tooltip_text),GUILayout.Width(20)))
        	{
        		script.settings.display_short_terrain = !script.settings.display_short_terrain;
        	}
        	if (script.settings.display_short_terrain){GUI.backgroundColor = Color.white;}
        
        	EditorGUILayout.EndHorizontal();
            
            if (script.terrains.Count == 0){script.terrains.Add(new terrain_class());}
            
            if (script.settings.remarks){draw_remarks(script.remarks,15);}
            
            // terrain loop
            if (!script.settings.display_short_terrain || script.terrains.Count < 3)
            {
	            for (count_terrain = 0;count_terrain < script.terrains.Count;++count_terrain)
		        {
		        	current_terrain = script.terrains[count_terrain];
		        	draw_terrain();	
				}
			}
			else
			{
				count_terrain = 0;
				current_terrain = script.terrains[0];
				draw_terrain();
				if (script.terrains.Count > 1)
				{
					EditorGUILayout.BeginHorizontal();
					GUILayout.Space(27);
					EditorGUILayout.LabelField("...");
					EditorGUILayout.EndHorizontal();
					count_terrain = script.terrains.Count-1;
					current_terrain = script.terrains[script.terrains.Count-1];
					draw_terrain();
				}
			}
			
			if (script.quick_tools)
	        {
	         	GUI.color = Color.white;
	         	EditorGUILayout.BeginHorizontal();
			    GUILayout.Space(15);
			    script.quick_tools_foldout = EditorGUILayout.Foldout(script.quick_tools_foldout,"Quick Tools");
			    EditorGUILayout.EndHorizontal();
	        	
	        	if (script.quick_tools_foldout)
	        	{
					EditorGUILayout.BeginHorizontal();
				    GUILayout.Space(30);
				    script.stitch_tool_foldout = EditorGUILayout.Foldout(script.stitch_tool_foldout,"Stitch Tool");
				    EditorGUILayout.EndHorizontal();
				        
				    if (script.stitch_tool_foldout)
				    {
				    	EditorGUILayout.BeginHorizontal();
						GUILayout.Space(45);
						if (script.terrains[0].terrain)
				    	{
					    	if (script.terrains[0].terrain.terrainData)
					    	{
						    	EditorGUILayout.LabelField("Border Influence",GUILayout.Width(120));
						        gui_changed_old = GUI.changed;
						        GUI.changed = false;
						        script.stitch_tool_border_influence = EditorGUILayout.Slider(script.stitch_tool_border_influence,script.terrains[0].heightmap_conversion.x*1.5,script.terrains[0].terrain.terrainData.size.x);
						        EditorGUILayout.LabelField("("+(script.stitch_tool_border_influence/script.terrains[0].heightmap_conversion.x).ToString("F2")+")");
						        if (GUI.changed)
						        {
						        	if (script.stitch_tool_border_influence < script.terrains[0].heightmap_conversion.x*1.5){script.stitch_tool_border_influence = Mathf.Ceil(script.terrains[0].heightmap_conversion.x*1.5);}
						        	if (script.stitch_tool_border_influence > script.terrains[0].terrain.terrainData.size.x){script.stitch_tool_border_influence = script.terrains[0].terrain.terrainData.size.x;}
						        }
						        GUI.changed = gui_changed_old;
						    }
					    } 
					    else
					    {
					    	EditorGUILayout.LabelField("Assign a terrain to Terrain List0");
					    }
					    EditorGUILayout.EndHorizontal();
										        				        
						if (script.terrains.Count < 2)
						{
							GUILayout.Space(5);
							EditorGUILayout.BeginHorizontal();
				        	GUILayout.Space(45);
				        	EditorGUILayout.LabelField("Multiple Terrains are needed");
							EditorGUILayout.EndHorizontal();
						}
						else
						{
							if (current_terrain.tiles.x == 1 || current_terrain.tiles.y == 1)
							{
								GUILayout.Space(5);
								EditorGUILayout.BeginHorizontal();
					       		GUILayout.Space(45);
					       		EditorGUILayout.LabelField("Terrains are not fitted to one big Tile",GUILayout.Width(220));
					       		GUI.color = Color.red;
				        		if (script.settings.tooltip_mode != 0)
						        {
						        	tooltip_text = "The terrains are not fitted together to one big Tile\n\nClick to foldout Size\n\nShift Click to Fit All";
						        }
				        		if (GUILayout.Button(GUIContent("",tooltip_text),EditorStyles.miniButtonMid,GUILayout.Width(23)))
				        		{
				        			if (!key.shift)
				        			{
					        			script.terrains[0].prearea.foldout = false;
					        			script.terrains[0].data_foldout = true;
					        			script.terrains[0].foldout = true;
					        			script.terrains[0].size_foldout = true;
					        			script.terrains[0].resolution_foldout = false;script.terrains[0].splat_foldout = false;script.terrains[0].tree_foldout = false;script.terrains[0].detail_foldout = false;
					        		}
					        		else
					        		{
					        			fit_all_terrains();
					        		}
				        		}
				        		GUI.color = color_terrain;
								EditorGUILayout.EndHorizontal();
							}
							else
							{
								EditorGUILayout.BeginHorizontal();
					       		GUILayout.Space(45);
								if (GUILayout.Button("Stitch",GUILayout.Width(70)))
								{
									if (script.stitch_tool_border_influence < script.terrains[0].heightmap_conversion.x*1.5){script.stitch_tool_border_influence = Mathf.Ceil(script.terrains[0].heightmap_conversion.x*1.5);}
				        			if (script.stitch_tool_border_influence > script.terrains[0].terrain.terrainData.size.x){script.stitch_tool_border_influence = script.terrains[0].terrain.terrainData.size.x;}
									stitch_terrains();	
								}
								EditorGUILayout.EndHorizontal();
							}
						}
			        }
			        
			        EditorGUILayout.BeginHorizontal();
				    GUILayout.Space(30);
				    script.slice_tool_foldout = EditorGUILayout.Foldout(script.slice_tool_foldout,"Slice Tool");
				    EditorGUILayout.EndHorizontal();
				        
				    if (script.slice_tool_foldout)
				    {
				    	EditorGUILayout.BeginHorizontal();
				        GUILayout.Space(45);
				        EditorGUILayout.LabelField("Slice Active",GUILayout.Width(120));
				        gui_changed_old = GUI.changed;
				        GUI.changed = false;
				        script.slice_tool_active = EditorGUILayout.Toggle(script.slice_tool_active,GUILayout.Width(25));
				        if (GUI.changed){if (!script.slice_tool_active){script.button_generate_text = "Generate";slice_tool_active = false;} else {script.button_generate_text = "Slice";}}
				        GUI.changed = gui_changed_old;
				        EditorGUILayout.EndHorizontal();
				        
				        EditorGUILayout.BeginHorizontal();
				        GUILayout.Space(45);
				        EditorGUILayout.LabelField("Slice Terrain",GUILayout.Width(120));
				        script.slice_tool_terrain = EditorGUILayout.ObjectField(script.slice_tool_terrain, Terrain,true,GUILayout.Width(200)) as Terrain;
				        EditorGUILayout.EndHorizontal();
				        
				        EditorGUILayout.BeginHorizontal();
				        GUILayout.Space(45);
				        EditorGUILayout.LabelField("Out of range Height",GUILayout.Width(120));
				        script.slice_tool_min_height = EditorGUILayout.FloatField(script.slice_tool_min_height,GUILayout.Width(70));
				        EditorGUILayout.EndHorizontal();
				        
				        EditorGUILayout.BeginHorizontal();
				        GUILayout.Space(45);
				        script.slice_tool_offset = EditorGUILayout.Vector2Field("Position Offset",script.slice_tool_offset);
				        EditorGUILayout.EndHorizontal();
				        
				        if (script.terrains.Count < 2)
						{
							GUILayout.Space(5);
							EditorGUILayout.BeginHorizontal();
				        	GUILayout.Space(45);
				        	EditorGUILayout.LabelField("Multiple Terrains are needed");
							EditorGUILayout.EndHorizontal();
						}
						else
						{
							if (current_terrain.tiles.x == 0 || current_terrain.tiles.y == 0)
							{
								GUILayout.Space(5);
								EditorGUILayout.BeginHorizontal();
					       		GUILayout.Space(45);
					       		EditorGUILayout.LabelField("Terrains are not fitted to one big Tile",GUILayout.Width(220));
					       		GUI.color = Color.red;
				        		if (script.settings.tooltip_mode != 0)
						        {
						        	tooltip_text = "The terrains are not fitted together to one big Tile\n\nClick to foldout Size\n\nShift Click to Fit All";
						        }
				        		if (GUILayout.Button(GUIContent("",tooltip_text),GUILayout.Width(23)))
				        		{
					        		if (!key.shift)
					        		{
					        			script.terrains[0].prearea.foldout = false;
					        			script.terrains[0].data_foldout = true;
					        			script.terrains[0].foldout = true;
					        			script.terrains[0].size_foldout = true;
					        			script.terrains[0].resolution_foldout = false;script.terrains[0].splat_foldout = false;script.terrains[0].tree_foldout = false;script.terrains[0].detail_foldout = false;
					        		}
					        		else
					        		{
					        			fit_all_terrains();
					        		}
				        		}
				        		GUI.color = color_terrain;
								EditorGUILayout.EndHorizontal();
							}
							else
							{
								if (script.slice_tool_terrain)
								{
									EditorGUILayout.BeginHorizontal();
						       		GUILayout.Space(45);
									EditorGUILayout.LabelField("Add Heightmap Layer, Filter on -> Height");
									EditorGUILayout.EndHorizontal();
								}
							}
						}
		        	}
		        	
		        	EditorGUILayout.BeginHorizontal();
		       		GUILayout.Space(30);
		       		script.smooth_tool_foldout = EditorGUILayout.Foldout(script.smooth_tool_foldout,"Smooth Tool");
		       		EditorGUILayout.EndHorizontal();
		       		
		       		if (script.smooth_tool_foldout)
		       		{
		       			if (script.terrains.Count > 1)
		       			{
			       			EditorGUILayout.BeginHorizontal();
			       			GUILayout.Space(45);
							EditorGUILayout.LabelField("Terrain",GUILayout.Width(120));	
							script.smooth_tool_terrain_select = EditorGUILayout.Popup(script.smooth_tool_terrain_select,script.smooth_tool_terrain,GUILayout.Width(64));							       			
				       		EditorGUILayout.EndHorizontal();
				       	}
			       		EditorGUILayout.BeginHorizontal();
		       			GUILayout.Space(45);
						EditorGUILayout.LabelField("Layer Strength",GUILayout.Width(120));								       		
						gui_changed_old = GUI.changed;
						GUI.changed = false;
						script.smooth_tool_layer_strength = EditorGUILayout.IntField(script.smooth_tool_layer_strength,GUILayout.Width(50));
						if (GUI.changed)
						{
							if (script.smooth_tool_strength < 1){script.smooth_tool_strength = 1;}
						}
						EditorGUILayout.EndHorizontal();
			       		
			       		EditorGUILayout.BeginHorizontal();
		       			GUILayout.Space(45);
						EditorGUILayout.LabelField("Strength",GUILayout.Width(120));								       		
						GUI.changed = false;
						script.smooth_tool_strength = EditorGUILayout.FloatField(script.smooth_tool_strength,GUILayout.Width(50));
						if (GUI.changed)
						{
							if (script.smooth_tool_strength < 0){script.smooth_tool_strength = 0;}
							if (script.smooth_tool_strength > 1){script.smooth_tool_strength = 1;}
						}
						GUI.changed = gui_changed_old;
			       		EditorGUILayout.EndHorizontal();
			       		
			       		EditorGUILayout.BeginHorizontal();
		       			GUILayout.Space(45);
						EditorGUILayout.LabelField("Repeat",GUILayout.Width(120));								       		
						GUI.changed = false;
						script.smooth_tool_repeat = EditorGUILayout.FloatField(script.smooth_tool_repeat,GUILayout.Width(50));
						if (GUI.changed)
						{
							if (script.smooth_tool_repeat < 0){script.smooth_tool_repeat = 0;}
						}
						GUI.changed = gui_changed_old;
			       		EditorGUILayout.EndHorizontal();
			       		
			       		EditorGUILayout.BeginHorizontal();
		       			GUILayout.Space(45);
			       		if (GUILayout.Button("Smooth",GUILayout.Width(70)))
			       		{
			       			if (script.smooth_tool_terrain_select < script.terrains.Count){script.smooth_terrain(script.terrains[script.smooth_tool_terrain_select],script.smooth_tool_strength);}
			       				else {script.smooth_all_terrain(script.smooth_tool_strength);}
			       		}
			       		EditorGUILayout.EndHorizontal();
			       	}
		       	}
		    }
	    }
	    
	    if (script.show_prelayer > script.prelayers.Count-1){script.show_prelayer = 0;}
	    draw_prelayer(script.prelayers[script.show_prelayer],3,String.Empty,1);
		
		if (script.generate_on_top){EditorGUILayout.EndScrollView();}
        GUILayout.Space(5);
        
        if (script.settings.color_scheme){GUI.color = Color.white;}
		
        if (script.meshcapture_tool)
        {
        	EditorGUILayout.BeginHorizontal();
        	script.meshcapture_tool_foldout = EditorGUILayout.Foldout(script.meshcapture_tool_foldout,"Mesh Capture Tool");
        	 
        	EditorGUILayout.EndHorizontal();
        	
        	if (script.meshcapture_tool_foldout)
        	{
        		EditorGUILayout.BeginHorizontal();
        		GUILayout.Space(15);
        		EditorGUILayout.LabelField("Object",GUILayout.Width(120));
        		script.meshcapture_tool_object = EditorGUILayout.ObjectField(script.meshcapture_tool_object,GameObject,true,GUILayout.Width(200)) as GameObject;
        		EditorGUILayout.EndHorizontal();
        		
        		EditorGUILayout.BeginHorizontal();
        		GUILayout.Space(15);
        		EditorGUILayout.LabelField("Pivot",GUILayout.Width(120));
        		script.meshcapture_tool_pivot = EditorGUILayout.ObjectField(script.meshcapture_tool_pivot,Transform,true,GUILayout.Width(200)) as Transform;
        		EditorGUILayout.EndHorizontal();
        		
        		EditorGUILayout.BeginHorizontal();
        		GUILayout.Space(15);
        		EditorGUILayout.LabelField("Image Width",GUILayout.Width(120));
        		script.meshcapture_tool_image_width = EditorGUILayout.IntField(script.meshcapture_tool_image_width,GUILayout.Width(50));
        		EditorGUILayout.EndHorizontal();
        		
        		EditorGUILayout.BeginHorizontal();
        		GUILayout.Space(15);
        		EditorGUILayout.LabelField("Image Height",GUILayout.Width(120));
        		script.meshcapture_tool_image_height = EditorGUILayout.IntField(script.meshcapture_tool_image_height,GUILayout.Width(50));
        		EditorGUILayout.EndHorizontal();
        		
        		EditorGUILayout.BeginHorizontal();
        		GUILayout.Space(15);
        		EditorGUILayout.LabelField("Mesh Scale",GUILayout.Width(120));
        		script.meshcapture_tool_scale = EditorGUILayout.FloatField(script.meshcapture_tool_scale,GUILayout.Width(120));
        		if (GUILayout.Button("Scale",GUILayout.Width(50)))
        		{
        			script.meshcapture_tool_scale = 1;
        		}
        		EditorGUILayout.EndHorizontal();
        		
        		EditorGUILayout.BeginHorizontal();
        		GUILayout.Space(15);
        		EditorGUILayout.LabelField("Save Scale",GUILayout.Width(120));
        		script.meshcapture_tool_save_scale = EditorGUILayout.Toggle(script.meshcapture_tool_save_scale,GUILayout.Width(25));
        		EditorGUILayout.EndHorizontal();

        		EditorGUILayout.BeginHorizontal();
        		GUILayout.Space(15);
        		EditorGUILayout.LabelField("Shadow Color",GUILayout.Width(120));
        		script.meshcapture_tool_shadows = EditorGUILayout.Toggle(script.meshcapture_tool_shadows,GUILayout.Width(25));
				EditorGUILayout.EndHorizontal();
        		
        		EditorGUILayout.BeginHorizontal();
        		GUILayout.Space(15);
        		EditorGUILayout.LabelField("Mesh Color",GUILayout.Width(120));
        		script.meshcapture_tool_color = EditorGUILayout.ColorField(script.meshcapture_tool_color,GUILayout.Width(120));
        		EditorGUILayout.EndHorizontal();
        		
 				EditorGUILayout.BeginHorizontal();
        		GUILayout.Space(15);
        		EditorGUILayout.LabelField("Background Color",GUILayout.Width(120));
        		script.meshcapture_background_color = EditorGUILayout.ColorField(script.meshcapture_background_color,GUILayout.Width(120));
        		EditorGUILayout.EndHorizontal();
        	}
        }
        
        var generate_call_time: float = 0;
        if (script2){generate_call_time = script2.generate_call_time2;}
        
        EditorGUILayout.BeginHorizontal();
        if (!script.meshcapture_tool){EditorGUILayout.LabelField("Generation time: "+script.generate_time.ToString("F2"), GUILayout.Width(160));}
        if (script2)
        {
        	GUI.color = Color(1-(Mathf.Abs(Mathf.Cos(progress_bar/2))),Mathf.Abs(Mathf.Cos(progress_bar/2)),Mathf.Abs(Mathf.Cos(progress_bar/2)));
        	EditorGUILayout.LabelField("-->",GUILayout.Width(25));
        	GUI.color = Color.white;
        	var terrain_text: String;
        	var comma: String;
        	
        	for (count_terrain2 = 0;count_terrain2 < script2.terrains.Count;++count_terrain2)
        	{
        		if (script2.terrains[count_terrain2].on_row)
        		{
        			terrain_text += comma+" "+script2.terrains[count_terrain2].name;
        			comma = ",";
        		}
        	}
        	
        	
        	if (script.settings.display_bar_auto_generate || !script.generate_auto)
        	{       	       
	        	for (var count_prelayers: int = 0;count_prelayers < script2.prelayer_stack.Count;++count_prelayers)
		       	{
						if (script2.prelayers[script2.prelayer_stack[count_prelayers]].prearea.area.width*script2.prelayers[script2.prelayer_stack[count_prelayers]].prearea.area.height > 2048)
						{        			
		        			var length: float = script2.prelayers[script2.prelayer_stack[count_prelayers]].prearea.area.height;
			        		var start_x3: float = script2.prelayers[script2.prelayer_stack[count_prelayers]].prearea.area.y;
			        		if (count_prelayers == 0){progress_bar = 100-(((script2.prelayers[script2.prelayer_stack[count_prelayers]].y-start_x3)/length)*100);}
			        		
			        		var rect: Rect = GUILayoutUtility.GetLastRect();
			        		rect.x += 30;
			        		rect.y += count_prelayers*20;
			        		rect.width = position.width-200; 
			        		rect.height = 18;
			        		EditorGUI.ProgressBar(rect,progress_bar/100,""+Mathf.Round(progress_bar)+"%");
			        	}
		        }
		   }     
		   EditorGUILayout.LabelField(""+terrain_text);
		  
        }
        EditorGUILayout.EndHorizontal();
        
        GUILayout.Space(2);

        if (script.button_export)
        {
			if (script.heightmap_output && !script.meshcapture_tool)
			{
				EditorGUILayout.BeginHorizontal();
				EditorGUILayout.LabelField("Export Heightmaps",GUILayout.Width(125));
				if (GUILayout.Button("<Auto Assign>",EditorStyles.miniButtonMid,GUILayout.Width(100)) && key.shift)
				{
					var file_info: FileInfo;
					for (count_terrain = 0;count_terrain < script.terrains.Count;++count_terrain)
					{
						if (script.terrains[count_terrain].active)
						{
							script.terrains[count_terrain].raw_save_file.file = script.raw_save_path+"/"+script.terrains[count_terrain].name;
							file_info = new FileInfo(script.terrains[count_terrain].raw_save_file.file);
							script.terrains[count_terrain].raw_save_file.filename = file_info.Name;
						}
					}
				}
				EditorGUILayout.EndHorizontal();
				
				EditorGUILayout.BeginHorizontal();
				EditorGUILayout.LabelField("Byte Order",GUILayout.Width(125));
				gui_changed_old = GUI.changed;
				GUI.changed = false;
				script.terrains[0].raw_save_file.mode = EditorGUILayout.EnumPopup(script.terrains[0].raw_save_file.mode);
				if (GUI.changed)
				{
					for (count_terrain = 0;count_terrain < script.terrains.Count;++count_terrain)
					{
						if (script.terrains[count_terrain].active)
						{
							script.terrains[count_terrain].raw_save_file.mode = script.terrains[0].raw_save_file.mode;
						}
					}
				}
				GUI.changed = gui_changed_old;
				EditorGUILayout.EndHorizontal();
				
				for (count_terrain = 0;count_terrain < script.terrains.Count;++count_terrain)
				{
					if (script.terrains[count_terrain].active)
					{
						EditorGUILayout.BeginHorizontal();
						EditorGUILayout.LabelField(script.terrains[count_terrain].name,GUILayout.Width(125));
						if (script.terrains[count_terrain].raw_save_file.file.Length != 0)
						{
							EditorGUILayout.LabelField("--> "+script.terrains[count_terrain].raw_save_file.file);
						}
						else
						{
							EditorGUILayout.LabelField("--> Choose a Path/Name");
						}
						if (GUILayout.Button("Save As",GUILayout.Width(64)))
						{
							var defaultname: String;
							if (script.terrains[count_terrain].raw_save_file.file == String.Empty){defaultname = script.terrains[count_terrain].name;} else {defaultname = script.terrains[count_terrain].raw_save_file.filename;}
							if (script.raw_save_path == String.Empty){script.raw_save_path = Application.dataPath;}
							defaultname = EditorUtility.SaveFilePanel("Save Heightmap As",script.raw_save_path,defaultname,"Raw");
							if (defaultname.Length != 0)
							{
								script.terrains[count_terrain].raw_save_file.file = defaultname;
								
								var file_info2: FileInfo = new FileInfo(defaultname);
								
								script.raw_save_path = file_info2.DirectoryName.Replace("\\","/");
								script.terrains[count_terrain].raw_save_file.filename = file_info2.Name;
							}
						}
						EditorGUILayout.EndHorizontal();
					}	
				}
			}        
        	else
        	{
	        	EditorGUILayout.BeginHorizontal();
	        	EditorGUILayout.LabelField("Path",GUILayout.Width(160));
	        	EditorGUILayout.LabelField(""+script.export_path);
	        	if (!script2)
	        	{
	        		if (GUILayout.Button(">Change",GUILayout.Width(75)))
	        		{
	        			if (!key.shift)
	        			{
		        			var export_path: String = EditorUtility.OpenFolderPanel("Export File Path",script.export_path,"");
		        			if (export_path != "")
		        			{
		        				script.export_path = export_path;
		        				if (export_path.IndexOf(Application.dataPath) == -1)
		        				{
		        					script.settings.colormap_assign = false;
		        					script.settings.colormap_auto_assign = false;
		        					script.settings.normalmap_auto_assign = false;
		        				}
		        			}
		        		}
		        		else
		        		{
		        			script.export_path = Application.dataPath;
		        			script.settings.colormap_assign = true;
		        		}
	        		}
	    		}
	        	EditorGUILayout.EndHorizontal();
	        	
	        	EditorGUILayout.BeginHorizontal();
	        	if (!script2)
	        	{
	        		EditorGUILayout.LabelField("Filename",GUILayout.Width(160));
	        		script.export_file = EditorGUILayout.TextField(script.export_file);
	        	} 
	        	else 
	        	{
	        		EditorGUILayout.LabelField("Filename",GUILayout.Width(160));
	        		EditorGUILayout.LabelField(script2.export_file);
	        	}
	        	EditorGUILayout.EndHorizontal();
	        }
        }
        
        if (script.color_output)
        {
        	if (script.button_export)
        	{
	        	if (script.settings.colormap)
	        	{
		        	EditorGUILayout.BeginHorizontal();
		        	EditorGUILayout.LabelField("Auto Assign",GUILayout.Width(160));
			        EditorGUILayout.LabelField("Colormap",GUILayout.Width(80));
			        gui_changed_old = GUI.changed;
			        GUI.changed = false;
			        if (!script.settings.colormap_assign){GUI.backgroundColor = Color.red;}
			        script.settings.colormap_auto_assign = EditorGUILayout.Toggle(script.settings.colormap_auto_assign,GUILayout.Width(25));
			        if (GUI.changed)
			        {
			        	if (!script.settings.colormap_assign)
			        	{
			        		script.settings.colormap_auto_assign = false;
			        		this.ShowNotification(GUIContent("Can't Assign colormap, because the export path is outside the project folder\n\n(Shift Click '>Change' to set path to project folder)"));
			        	}
			        	if (script.settings.colormap_auto_assign){script.settings.normalmap_auto_assign = false;}
			        }
			        if (!script.settings.colormap_assign){GUI.backgroundColor = Color.white;}
			        
		        	if (script.settings.triplanar)
		        	{
			        	EditorGUILayout.LabelField("Normalmap",GUILayout.Width(80));
				        GUI.changed = false;
				        if (!script.settings.colormap_assign){GUI.backgroundColor = Color.red;}
				        script.settings.normalmap_auto_assign = EditorGUILayout.Toggle(script.settings.normalmap_auto_assign,GUILayout.Width(25));
				        if (GUI.changed)
				        {
				        	if (!script.settings.colormap_assign)
				        	{
				        		script.settings.normalmap_auto_assign = false;
				        		this.ShowNotification(GUIContent("Can't Assign colormap, because the export path is outside the project folder\n\n(Shift Click '>Change' to set path to project folder)"));
				        	}
				        	if (script.settings.normalmap_auto_assign){script.settings.colormap_auto_assign = false;}
				        }
				        if (!script.settings.colormap_assign){GUI.backgroundColor = Color.white;}
				    }
		        	
		        	GUI.changed = gui_changed_old;
		        	EditorGUILayout.EndHorizontal();
		        }
	        }
        	
        	EditorGUILayout.BeginHorizontal();
        	EditorGUILayout.LabelField("Color Advanced",GUILayout.Width(160));
	        script.export_color_advanced = EditorGUILayout.Toggle(script.export_color_advanced,GUILayout.Width(25));
        	EditorGUILayout.EndHorizontal();
	        
	        if (script.export_color_advanced)
	        {
	        	EditorGUILayout.BeginHorizontal();
	        	gui_changed_old = false;
	        	GUI.changed = false;
		        EditorGUILayout.LabelField("Color Channel",GUILayout.Width(160));
		        script.export_color = EditorGUILayout.ColorField(script.export_color);
		        EditorGUILayout.EndHorizontal();
		        
		        EditorGUILayout.BeginHorizontal();
		        EditorGUILayout.LabelField("Color Curve Advanced",GUILayout.Width(160));
		    	script.export_color_curve_advanced = EditorGUILayout.Toggle(script.export_color_curve_advanced,GUILayout.Width(25));
        	    EditorGUILayout.EndHorizontal();
		        
		        if (script.export_color_curve_advanced)
		        {
		        	EditorGUILayout.BeginHorizontal();
			        EditorGUILayout.LabelField("Color Curve Red",GUILayout.Width(160));
			        script.export_color_curve_red = EditorGUILayout.CurveField(script.export_color_curve_red);
			        EditorGUILayout.EndHorizontal();
			        
			        EditorGUILayout.BeginHorizontal();
			        EditorGUILayout.LabelField("Color Curve Green",GUILayout.Width(160));
			        script.export_color_curve_green = EditorGUILayout.CurveField(script.export_color_curve_green);
			        EditorGUILayout.EndHorizontal();
			        
			        EditorGUILayout.BeginHorizontal();
			        EditorGUILayout.LabelField("Color Curve Blue",GUILayout.Width(160));
			        script.export_color_curve_blue = EditorGUILayout.CurveField(script.export_color_curve_blue);
			        EditorGUILayout.EndHorizontal();
		        }
		        else
		        {
			        EditorGUILayout.BeginHorizontal();
			        EditorGUILayout.LabelField("Color Curve",GUILayout.Width(160));
			        script.export_color_curve = EditorGUILayout.CurveField(script.export_color_curve);
			        EditorGUILayout.EndHorizontal();
			    }
			    
			    if (GUI.changed)
			    {
			        gui_changed_old = true;
			    	if (script.generate_auto){generate_auto();}
			    }
			    GUI.changed = gui_changed_old;
		    }
	    }
        GUILayout.Space(10);
        
        if (!script2 || script.generate_auto)
        {
        	// generate button
        	EditorGUILayout.BeginHorizontal();
        	if (GUILayout.Button(script.button_generate_text,GUILayout.Width(100)) || (key.control && key.keyCode == KeyCode.G))
        	{
        		if (!script.meshcapture_tool)
        		{
        			if (script.button_export && script.heightmap_output)
        			{
        				var export_text: String;
        				var active: boolean = false;
        				var path_set: boolean = false;
        				for (count_terrain = 0;count_terrain < script.terrains.Count;++count_terrain)
        				{
        					if (script.terrains[count_terrain].active && script.terrains[count_terrain].terrain)
        					{
        						active = true;
        						if (script.terrains[count_terrain].raw_save_file.file.Length != 0)
        						{
        							path_set = true;
        							script.terrains[count_terrain].raw_save_file.save(script.terrains[count_terrain]);
        							export_text += "Exported --> "+script.terrains[count_terrain].raw_save_file.filename+"\n";
        						}
        					}
        				}
        				if (active)
        				{
        					if (path_set)
        					{	
        						this.ShowNotification(GUIContent(export_text));
        						AssetDatabase.Refresh();
        					}
        				} 
        				else {this.ShowNotification(GUIContent("No Terrain is active"));}
        			}
        			else
        			{
						if (key.shift)
						{
							script.generate_auto = !script.generate_auto;
							if (!script.generate_auto)
							{
								script.generate_call = false;
								script.generate_call_delay = -1;
							}
						}
						else if (key.alt)
						{
							if (script.generate_auto)
							{
								if (script.generate_auto_mode == 2){script.generate_auto_mode = 1;}
								else if (script.generate_auto_mode == 1){script.generate_auto_mode = 2;}
							}
						}
						else if (key.control)
						{
							script.generate_speed_display = !script.generate_speed_display;
						}
						else 
						{
							script.generate_call_delay = -1;
							script.generate_call = false;
							script.generate_manual = true;
							generate_startup();
						}
        			}
        		}
        		else 
        		{
        			if (script.export_meshcapture() == -1){this.ShowNotification(GUIContent("No GameObject assigned"));}
        		}
        	}
        	
        	if (script.generate_auto)
        	{
        		if (script.generate_auto_mode == 1)
        		{
        			EditorGUILayout.LabelField("Auto (Fast) -> Delay",GUILayout.Width(140));
        			script.generate_auto_delay1 = EditorGUILayout.Slider(script.generate_auto_delay1,0,1);
        		}
        		else if (script.generate_auto_mode == 2)
        		{
        			EditorGUILayout.LabelField("Auto (Slow) -> Delay",GUILayout.Width(140));
        			script.generate_auto_delay2 = EditorGUILayout.Slider(script.generate_auto_delay2,0.1,4);
        		}
        	}
        	else
        	{
        		if (script.generate_speed_display)
        		{
	        		gui_changed_old = GUI.changed;
			        GUI.changed = false;
			        EditorGUILayout.BeginHorizontal();
			        EditorGUILayout.LabelField("Speed ->",GUILayout.Width(70));
			        script.generate_step = EditorGUILayout.Slider(script.generate_step,1,100);
			        EditorGUILayout.EndHorizontal();
			        if (GUI.changed)
			        {
			        	if (script2){script2.generate_step = script.generate_step;}
			        }
			        GUI.changed = gui_changed_old;
			    }
        	}
        	EditorGUILayout.EndHorizontal();
        } 
        else 
        {
	        if (script2.generate && !script.generate_auto)
	        {
	        	var button_pause_text: String;
	        	if (script2.generate_pause){button_pause_text = "Resume";} else {button_pause_text = "Pause";}
	        	EditorGUILayout.BeginHorizontal();
	        	if (GUILayout.Button(button_pause_text,GUILayout.Width(60)) || (key.keyCode == KeyCode.P && key.control)){script2.generate_pause = !script2.generate_pause;}
	        	if (GUILayout.Button("Restart",GUILayout.Width(60)))
	        	{
	        		generate_stop();
	        		generate_startup();
	        	}
	        	if (GUILayout.Button("Stop",GUILayout.Width(50)) || (key.keyCode == KeyCode.S && key.control))
	        	{
	        		script.generate_call_delay = -1;
					script.generate_call = false;
		
	        		generate_stop();
	        	}
	        	EditorGUILayout.EndHorizontal();
	        	//GUILayout.Space(25);
	        }
        }
        
        GUILayout.Space(10);
		
        if (!script.generate_on_top){EditorGUILayout.EndScrollView();}
    }
	    
    function generate_stop()
    {
		script.generate_manual = false;
		Application.runInBackground = run_in_background;
		
		if (script2.unload_textures){script2.unload_textures1();}
		for (var count_terrain: int = 0;count_terrain < script2.terrains.Count;++count_terrain)
		{
	    	if (script2.terrains[count_terrain].heights)
	    	{
	    		if (script2.terrains[count_terrain].heights.Length > 0){script2.terrains[count_terrain].heights = new float[0,0];}
	    	}
	    	for (var count_grass: int = 0;count_grass < script2.terrains[count_terrain].grass_detail.Length;++count_grass)
	    	{
	    		if (script2.terrains[count_terrain].grass_detail[count_grass])
	    		{
	    			if (script2.terrains[count_terrain].grass_detail[count_grass].detail.Length > 0){script2.terrains[count_terrain].grass_detail[count_grass].detail = new int[0,0];}
	    		}
	    	}
	    }
    	var clean_memory: boolean = script2.clean_memory;
    	script2 = null;
    	DestroyImmediate(Generate_Scene);
    	if (clean_memory)
    	{
    		UnityEngine.Resources.UnloadUnusedAssets();
			System.GC.Collect();
		}
	}
  
    function MyUpdate() 
    {    
    	if (!script){return;}
		check_content_done();
		
    	if (script.erosion_move){script.erosion_alive();}
    	
    	if (Time.realtimeSinceStartup > time_generate_call+script.generate_call_delay && script.generate_call_delay != -1)
		{
			if (!script2){generate_startup();script.generate_call_delay = -1;script.generate_call = false;}
		}
    	
    	if (!script2){return;}  
    	
    	if (script2.generate && !script2.generate_pause)
    	{
    		if (script2 && script){script.generate_time = script2.generate_time;}
    		if (script2.generate_output(script2.prelayer) == 2)
    		{
    			if (script2.settings.colormap && script2.button_export)
				{
					if (script2.settings.colormap_auto_assign)
					{
						AssetDatabase.Refresh();
						if (script.preterrain.splatPrototypes.Count == 0){script.set_colormap(true);}
						script.preterrain.splatPrototypes[0].texture = AssetDatabase.LoadAssetAtPath(script2.export_path.Replace(Application.dataPath,"Assets")+"/"+script2.export_name+".png",Texture) as Texture2D;
						script.set_terrain_splat_textures(script.preterrain,script.preterrain);
						script.check_synchronous_terrain_splat_textures(current_terrain);
						set_image_import_settings(script.preterrain.splatPrototypes[0].texture);
						
					}
					else if (script2.settings.normalmap_auto_assign)
					{
						AssetDatabase.Refresh();
						script.preterrain.splatPrototypes[0].normal_texture = AssetDatabase.LoadAssetAtPath(script2.export_path.Replace(Application.dataPath,"Assets")+"/"+script2.export_name+".png",Texture) as Texture2D;
						set_image_import_settings(script.preterrain.splatPrototypes[0].normal_texture);
						script.set_terrain_splat_textures(script.preterrain,script.preterrain);
						script.check_synchronous_terrain_splat_textures(current_terrain);
						script.set_terrain_splat_textures(script.preterrain,script.preterrain);
					}
				}	
    		}
    		if (!script2.generate)
    		{
    			if (script2.stitch_command)
    			{
    				stitch_terrains();
    			}
    			if (script2.button_export)
    			{
    				AssetDatabase.Refresh();
    			}	
    			generate_stop();
    		}
    		this.Repaint();
    	}
    }
    
	function check_point_in_rect(rect: Rect,point: Vector2): boolean
	{
		var in_rect: boolean = false;
		
		if (point.x > rect.xMin && point.x < rect.xMin+rect.width && point.y > rect.y && point.y < rect.y+rect.height){in_rect = true;}
		
		return in_rect;
	}
	
	function generate_startup()
	{
		script.convert_software_version();
		
		if (script.settings.run_in_background)
		{
			run_in_background = script.settings.run_in_background;
			Application.runInBackground = true;
		}
		
		Generate_Scene = GameObject.Find("<Generating>");
		if (Generate_Scene){DestroyImmediate(Generate_Scene);}
		Generate_Scene = Instantiate(TerrainComposer_Scene);
		Generate_Scene.name = "<Generating>";
		Generate_Scene_name = Generate_Scene.name;
		script2 = Generate_Scene.GetComponent(terraincomposer_save);
		script2.script_base = script;
		var generate_code: int = script2.generate_begin();
		
		if (generate_code == 1){script2.generate = true;} 
        	else 
        	{
        		if (generate_code == -1){this.ShowNotification(GUIContent("No Terrain is Active or Assigned"));}
        		if (generate_code == -2 && script.generate_manual){this.ShowNotification(GUIContent("Current settings will not generate an output"));}
        		if (generate_code == -3)
        		{
        			this.ShowNotification(GUIContent("Please assign splat textures to "+script2.preterrain.terrain.name));
        			script.terrains_foldout = true;
        			script.terrains[script2.preterrain.index_old].foldout = true;
        			script.terrains[script2.preterrain.index_old].splat_foldout = true;
        			script.terrains[script2.preterrain.index_old].data_foldout = true;
        			script.terrains[script2.preterrain.index_old].size_foldout = false;
        			script.terrains[script2.preterrain.index_old].resolution_foldout = false;
        			script.terrains[script2.preterrain.index_old].reset_foldout = false;
        			script.terrains[script2.preterrain.index_old].scripts_foldout = false;
        			script.terrains[script2.preterrain.index_old].tree_foldout = false;
        			script.terrains[script2.preterrain.index_old].detail_foldout = false;
        		}
        		if (generate_code == -4){this.ShowNotification(GUIContent("For the Color Output to work you need to assign the Red, Green and Blue splat texture to "+script2.preterrain.terrain.name));}
        		if (generate_code == -5){this.ShowNotification(GUIContent("There is only 1 splat texture assigned to "+script2.preterrain.terrain.name+"\n\nSplat Output needs at least 2 splat texures to have effect"));}
        		if (generate_code == -6){this.ShowNotification(GUIContent("Please assign a Terrain for Slicing"));}
        		if (generate_code == -7){this.ShowNotification(GUIContent("The splat length of "+script2.preterrain.terrain.name+" ("+script2.preterrain.terrain.terrainData.splatPrototypes.Length+" splats)"+" should be the same or higher than "+script2.terrains[0].terrain.name+" ("+script2.terrains[0].terrain.terrainData.splatPrototypes.Length+" splats)"));}
        		if (generate_code == -8){this.ShowNotification(GUIContent("The grass/detail length of "+script2.preterrain.terrain.name+" ("+script2.preterrain.terrain.terrainData.detailPrototypes.Length+" grass)"+" should the same or higher than "+script2.terrains[0].terrain.name+" ("+script2.terrains[0].terrain.terrainData.detailPrototypes.Length+" grass)"));}
        		
        		// generate_stop();
        		DestroyImmediate(Generate_Scene);
        	}
	}
	
	function generate_auto()
	{
		if (script.generate_auto)
		{
			if (script.generate_auto_mode == 1 && !script.generate_call)
			{
				script.generate_call_delay = script.generate_auto_delay1;
				time_generate_call = Time.realtimeSinceStartup;
				script.generate_call = true;
			}
			else if (script.generate_auto_mode == 2)
			{
				script.generate_call_delay = script.generate_auto_delay2;
				time_generate_call = Time.realtimeSinceStartup;
			}
		}
	}
	
	function draw_terrain()
	{
		color_terrain = script.settings.color.color_terrain;
	    if (!current_terrain.active){color_terrain += Color(-0.2,-0.2,-0.2,0);} 
	        	
	    if (current_terrain.color_terrain != color_terrain)
		{
			if (current_terrain.color_terrain[0] > color_terrain[0]){current_terrain.color_terrain[0] -= 0.003;} 
		    else if (current_terrain.color_terrain[0]+0.01 < color_terrain[0]){current_terrain.color_terrain[0] += 0.003;}	
		           			else {current_terrain.color_terrain[0] = color_terrain[0];}
		           	if (current_terrain.color_terrain[1] > color_terrain[1]){current_terrain.color_terrain[1] -= 0.003;} 
		           		else if (current_terrain.color_terrain[1]+0.01 < color_terrain[1]){current_terrain.color_terrain[1] += 0.003;}
		           			else {current_terrain.color_terrain[1] = color_terrain[1];}
					if (current_terrain.color_terrain[2] > color_terrain[2]){current_terrain.color_terrain[2] -= 0.003;} 
						else if (current_terrain.color_terrain[2]+0.01 < color_terrain[2]){current_terrain.color_terrain[2] += 0.003;}
							else {current_terrain.color_terrain[2] = color_terrain[2];}
					if (current_terrain.color_terrain[3] > color_terrain[3]){current_terrain.color_terrain[3] -= 0.003;} 
						else if (current_terrain.color_terrain[3]+0.01 < color_terrain[3]){current_terrain.color_terrain[3] += 0.003;}
							else {current_terrain.color_terrain[3] = color_terrain[3];}
		        	this.Repaint();
		        }
		        
		        if (script.settings.color_scheme){color_terrain = current_terrain.color_terrain;} else {color_terrain = Color.white;}
		        GUI.color = color_terrain;
	        	
	        	EditorGUILayout.BeginHorizontal();
	      		GUILayout.Space(30);
	        	var Lastrect2: Rect = GUILayoutUtility.GetLastRect();
	        	Lastrect2.x += 15;
	        	Lastrect2.y += 2;
	        	Lastrect2.width = 15;
	        	Lastrect2.height = 15;
	        	var backgroundcolor: Color = Color.white;
	      	  	if (script2)
	      	  	{
	      	  		if (script2.generate)
	      	  		{
	      	  			for (var count_terrain2: int = 0;count_terrain2 < script2.terrains.Count;++count_terrain2)
	      	  			{
	      	  				if (script2.terrains[count_terrain2].index_old == count_terrain)
	      	  				{
	      	  					if (script2.terrains[count_terrain2].on_row)
	      	  					{
	      	  						GUI.color = Color(1-(Mathf.Abs(Mathf.Cos(progress_bar/2))),Mathf.Abs(Mathf.Cos(progress_bar/2)),Mathf.Abs(Mathf.Cos(progress_bar/2)));
	      	  						backgroundcolor = Color(1-(progress_bar/100),1,1-(progress_bar/100));
	      	  					}
	      	  				}
	      	  			}
	      	  		}
	       		}
	       		
	       	  	current_terrain.foldout = EditorGUI.Foldout(Lastrect2,current_terrain.foldout,"");
	       	  	GUI.color = color_terrain;
	       	  	if (script2)
	        	{
	        		if (script2.generate){GUI.backgroundColor = backgroundcolor;} 
	        	}
	        	gui_changed_old = GUI.changed;
	        	GUI.changed = false;
	        	
	        	// terrain foldout
	        	current_terrain.terrain = EditorGUILayout.ObjectField(current_terrain.terrain,Terrain,true,GUILayout.Width(200)) as Terrain;
	        	if (GUI.changed)
	        	{
	        		if (script.terrains_check_double(current_terrain)){this.ShowNotification(GUIContent("The terrain is already in list!"));}
	        		if (current_terrain.terrain){current_terrain.name = current_terrain.terrain.name;}
	        		if (current_terrain)
	        		{
	        			script.get_terrain_settings(current_terrain,"(all)(fir)");
	        			assign_terrain_splat_alpha(current_terrain);
	        		}
	        	}
	        	GUI.changed = gui_changed_old;
	        	GUI.backgroundColor = Color.white;
	        	
	        	if (current_terrain.terrain)
	        	{
		        	if (current_terrain.terrain.terrainData)
		        	{
		        		if (GUILayout.Button(GUIContent(current_terrain.prearea.resolution_mode_text,current_terrain.prearea.resolution_tooltip_text),EditorStyles.miniButtonMid,GUILayout.Width(50)))
			        	{
			        		current_terrain.foldout = true;
			        		current_terrain.data_foldout = false;
			        		current_terrain.prearea.foldout = true;
			        	}
		        
			        	if (script.terrains.Count > 1)
			        	{
			        		if (current_terrain.tiles.x == 1 || current_terrain.tiles.y == 1)
			        		{
			        			GUI.color = Color.red;
			        			if (script.settings.tooltip_mode != 0)
						        {
						        	tooltip_text = "The terrains are not fitted together to one big Tile\n\nClick to foldout Size\n\nShift Click to Fit All";
						        }
			        			if (GUILayout.Button(GUIContent("",tooltip_text),EditorStyles.miniButtonMid,GUILayout.Width(23)))
			        			{
			        				if (!key.shift)
			        				{
				        				current_terrain.prearea.foldout = false;
				        				current_terrain.data_foldout = true;
				        				current_terrain.foldout = true;
				        				current_terrain.size_foldout = true;
				        				current_terrain.resolution_foldout = false;
				        				current_terrain.splat_foldout = false;
				        				current_terrain.tree_foldout = false;
				        				current_terrain.detail_foldout = false;
				        			}
				        			else
				        			{
				        				fit_all_terrains();
				        			}
			        			}
			        			GUI.color = color_terrain;
			        		}
			        	}
			        	
				        if (!current_terrain.size_synchronous)
						{
							GUI.color = Color.green;
							
						    if (script.settings.tooltip_mode != 0)
						    {
							   	tooltip_text = "The Terrain Size is not Synchronous with "+current_terrain.name+" in Scene\n\nClick to foldout Size";
						    }
		        			if(GUILayout.Button(GUIContent("SZ",tooltip_text),EditorStyles.miniButtonMid,GUILayout.Width(28)))
							{
								current_terrain.foldout = true;
								current_terrain.data_foldout = true;
								current_terrain.size_foldout = true;
								current_terrain.resolution_foldout = false;
								current_terrain.splat_foldout = false;current_terrain.tree_foldout = false;current_terrain.detail_foldout = false;current_terrain.prearea.foldout = false;
							}
							GUI.color = color_terrain;
						} 
						
				        if (!current_terrain.resolutions_synchronous)
						{
							GUI.color = Color.green;
							if (script.settings.tooltip_mode != 0)
						    {
						    	tooltip_text = "The Terrain Resolutions are not Synchronous with "+current_terrain.name+" in Scene\n\nClick to foldout Resolutions";
						    }
							if(GUILayout.Button(GUIContent("R",tooltip_text),EditorStyles.miniButtonMid,GUILayout.Width(23)))
							{
								current_terrain.foldout = true;current_terrain.data_foldout = true;current_terrain.resolution_foldout = true;
								current_terrain.splat_foldout = false;current_terrain.tree_foldout = false;current_terrain.detail_foldout = false;current_terrain.prearea.foldout = false;current_terrain.size_foldout = false;
							}
							GUI.color = color_terrain;
						} 				        
									
				        if (!current_terrain.splat_synchronous)
				        {
				        	GUI.color = Color.green;
				        	if (script.settings.tooltip_mode != 0)
						    {
							   	tooltip_text = "The Terrain Splat Textures are not Synchronous with "+current_terrain.name+" in Scene\n\nClick to foldout Splat Textures";
						    }
				        	if(GUILayout.Button(GUIContent("S",tooltip_text),EditorStyles.miniButtonMid,GUILayout.Width(23)))
				        	{
				        		current_terrain.foldout = true;current_terrain.data_foldout = true;current_terrain.splat_foldout = true;
				        		current_terrain.resolution_foldout = false;current_terrain.tree_foldout = false;current_terrain.detail_foldout = false;current_terrain.prearea.foldout = false;current_terrain.size_foldout = false;
				        	}
				        	GUI.color = color_terrain;
				        } 
				        	
				        if (!current_terrain.tree_synchronous)
				        {
				        	GUI.color = Color.green;
				        	if (script.settings.tooltip_mode != 0)
						    {
							   	tooltip_text = "The Terrain Trees are not Synchronous with "+current_terrain.name+" in Scene\n\nClick to foldout Trees";
						    }
				        	if(GUILayout.Button(GUIContent("T",tooltip_text),EditorStyles.miniButtonMid,GUILayout.Width(23)))
				        	{
				        		current_terrain.foldout = true;current_terrain.data_foldout = true;current_terrain.tree_foldout = true;
				        		current_terrain.splat_foldout = false;current_terrain.resolution_foldout = false;current_terrain.detail_foldout = false;current_terrain.prearea.foldout = false;current_terrain.size_foldout = false;
				        	}
				        	GUI.color = color_terrain;
				        } 
				        	
				        if (!current_terrain.detail_synchronous)
				        {
				        	GUI.color = Color.green;
				        	if (script.settings.tooltip_mode != 0)
						    {
							   	tooltip_text = "The Terrain Grass/Details are not Synchronous with "+current_terrain.name+" in Scene\n\nClick to foldout Grass/Details";
						    }
				        	if(GUILayout.Button(GUIContent("D",tooltip_text),EditorStyles.miniButtonMid,GUILayout.Width(23)))
				        	{
				        		current_terrain.foldout = true;current_terrain.data_foldout = true;current_terrain.detail_foldout = true;
				        		current_terrain.splat_foldout = false;current_terrain.tree_foldout = false;current_terrain.resolution_foldout = false;current_terrain.prearea.foldout = false;current_terrain.size_foldout = false;
				        	}
				        	GUI.color = color_terrain;
				        }
     		        }
			        else
		        	{
		        		EditorGUILayout.LabelField("Missing TerrainData. Fix this manually in the Scene or create a new terrain");
		        		if (GUILayout.Button(GUIContent("-",tooltip_text),GUILayout.Width(25)) && key.control && script.terrains.Count > 1)
				       	{
				       		Undo.RegisterUndo(script,"Terrain Erase");
				    		script.erase_terrain(count_terrain);
				       		this.Repaint();
					       	return;
				       	}
				       	EditorGUILayout.EndHorizontal();
		        		return;
		        	}
		        }
		        
		        if (!script.settings.toggle_text_no)
			    {
			   		if (script.settings.toggle_text_long){EditorGUILayout.LabelField("Active",GUILayout.Width(50));} else {EditorGUILayout.LabelField("Act",GUILayout.Width(28));}
			   	}
			   	gui_changed_old = GUI.changed;
			   	GUI.changed = false;
			   	current_terrain.active = EditorGUILayout.Toggle(current_terrain.active);
			   	if (GUI.changed)
			   	{
			    	gui_changed_old = true;
			    }
			       	GUI.changed = gui_changed_old;
			       	if (script.settings.tooltip_mode != 0)
				{
					tooltip_text = "Erase this Terrain\n\n(Control Click)";
				}
				
		        if (GUILayout.Button(GUIContent("-",tooltip_text),GUILayout.Width(25)) && key.control && script.terrains.Count > 1)
			    {
			       	Undo.RegisterUndo(script,"Terrain Erase");
			    	script.erase_terrain(count_terrain);
			       	this.Repaint();
				    return;
			    } 
			    
		       	EditorGUILayout.EndHorizontal();
	        	
	        	if (current_terrain.foldout)
	        	{
	        		if (current_terrain.terrain)
	        		{
	        			
	        			draw_area(0,current_terrain.prearea,current_terrain,0,false);
	        		}
	        		
					EditorGUILayout.BeginHorizontal();
		        	GUILayout.Space(30);
		        	current_terrain.data_foldout = EditorGUILayout.Foldout(current_terrain.data_foldout,"Data");
		        	EditorGUILayout.EndHorizontal();
	        		
	        		if (current_terrain.data_foldout)
	        		{
	        			EditorGUILayout.BeginHorizontal();
		        		GUILayout.Space(45);
		        		current_terrain.maps_foldout = EditorGUILayout.Foldout(current_terrain.maps_foldout,"Heightmaps");
		        		EditorGUILayout.EndHorizontal();
		        		
		        		// terrain heightmap foldout
		        		if (current_terrain.maps_foldout)
	        			{
		        			EditorGUILayout.BeginHorizontal();
		        			GUILayout.Space(60);
		        			EditorGUILayout.LabelField("Heightmap File",GUILayout.Width(147));
		        			
		        			if (current_terrain.raw_file_index > script.raw_files.Count-1){current_terrain.raw_file_index = -1;return;}
		        			if (current_terrain.raw_file_index < 0){EditorGUILayout.LabelField("Not Loaded",GUILayout.Width(70));}
		        			else
		        			{
		        				EditorGUILayout.LabelField(GUIContent(script.raw_files[current_terrain.raw_file_index].filename,script.raw_files[current_terrain.raw_file_index].file),GUILayout.Width(script.raw_files[current_terrain.raw_file_index].filename.Length*8));
		        			}
		        			if (GUILayout.Button("Open",GUILayout.Width(55)))
		        			{
		        				var raw_file: String;
		        				
		        				if (script.raw_path == String.Empty){script.raw_path = Application.dataPath;}  
		        				
		        				if (Application.platform == RuntimePlatform.OSXEditor){raw_file = EditorUtility.OpenFilePanel("Open Heightmap File",script.raw_path,"raw");}
		        				else {raw_file = EditorUtility.OpenFilePanel("Open Heightmap File",script.raw_path,"Raw;*.r16;*.raw");}
		        						        				
		        				if (raw_file.Length != 0)
		        				{
		        					var raw_file_index: int = script.add_raw_file(raw_file);
		        					
		        					if (raw_file_index == -2){this.ShowNotification(GUIContent("Raw file has invalid resolution"));}
		        					if (raw_file_index > -1)
		        					{
		        						current_terrain.raw_file_index = raw_file_index;
		        						script.raw_path = raw_file;
		        						script.clean_raw_file_list();
		        					}
								}
		        			}
		        			EditorGUILayout.EndHorizontal();
		        			
		        			EditorGUILayout.BeginHorizontal();
		        			GUILayout.Space(60);
		        			if (current_terrain.raw_file_index < 0){EditorGUILayout.LabelField("(The heightmap resolution from the raw file must be the same as the heightmap resolution)");}
		        			EditorGUILayout.EndHorizontal();
		        			
		        			EditorGUILayout.BeginHorizontal();
		        			GUILayout.Space(60);
		        			if (current_terrain.raw_file_index < 0){EditorGUILayout.LabelField("(A filter in a heightmap layer, with input -> Raw Heightmap, has much more features)");}
		        			EditorGUILayout.EndHorizontal();
		        			
		        			if (current_terrain.raw_file_index > -1)
		        			{
			        			EditorGUILayout.BeginHorizontal();
			        			GUILayout.Space(60);
			        			EditorGUILayout.LabelField("Resolution",GUILayout.Width(147));
			        			EditorGUILayout.LabelField(""+script.raw_files[current_terrain.raw_file_index].resolution);
			        			EditorGUILayout.EndHorizontal();
			        			
			        			EditorGUILayout.BeginHorizontal();
			        			GUILayout.Space(60);
			        			EditorGUILayout.LabelField("Byte Order",GUILayout.Width(147));
			        			script.raw_files[current_terrain.raw_file_index].mode = EditorGUILayout.EnumPopup(script.raw_files[current_terrain.raw_file_index].mode,GUILayout.Width(64));
		        				EditorGUILayout.EndHorizontal();
			        		
			        		
			        			EditorGUILayout.BeginHorizontal();
			        			GUILayout.Space(60);
			        			if (GUILayout.Button("<Assign>",GUILayout.Width(70)) && key.shift)
			        			{
			        				script.assign_heightmap(current_terrain);
			        			}
			        			if (script.terrains.Count > 1)
			        			{
				        			if (GUILayout.Button("<Assign All>",GUILayout.Width(85)) && key.shift)
				        			{
				        				script.assign_heightmap_all_terrain();
				        			}
				        			if (GUILayout.Button("<Auto Search>",GUILayout.Width(100)) && key.shift)
				        			{
				        				script.auto_search_heightmap(current_terrain);
				        			}
			        			}
			        			EditorGUILayout.EndHorizontal();
			        		}
		        		}
		        		
	        			EditorGUILayout.BeginHorizontal();
		        		GUILayout.Space(45);
		        		current_terrain.size_foldout = EditorGUILayout.Foldout(current_terrain.size_foldout,"Size");
		        		EditorGUILayout.EndHorizontal();
	        		
	        			if (current_terrain.size_foldout)
	        			{
		        			EditorGUILayout.BeginHorizontal();
			        		GUILayout.Space(60);
			        		gui_changed_old = GUI.changed;
			        		GUI.changed = false;
			        		current_terrain.size = EditorGUILayout.Vector3Field("Size",current_terrain.size);
			        		if (GUI.changed)
			        		{
			        			if (current_terrain.size.x < 1){current_terrain.size.x = 1;}
			        			if (current_terrain.size.y < 1){current_terrain.size.y = 1;}
			        			if (current_terrain.size.z < 1){current_terrain.size.z = 1;}
			        			script.check_synchronous_terrain_size(current_terrain);
			        		}
			        		GUI.changed = gui_changed_old;
			        		EditorGUILayout.EndHorizontal();
			        		
			        		if (current_terrain.terrain)
			        		{
				        		EditorGUILayout.BeginHorizontal();
				        		GUILayout.Space(60);
				        		if (script.settings.tooltip_mode != 0)
				        		{
				    				tooltip_text = "Get Terrain Size from "+current_terrain.name+" in Scene\n\n(Shift Click)";
				    			}
				        		if (GUILayout.Button(GUIContent("<Get>",tooltip_text),GUILayout.Width(75)) && key.shift){script.get_terrain_settings(current_terrain,"(siz)(con)");script.check_synchronous_terrain_size(current_terrain);}
				        		if (!current_terrain.size_synchronous)
				        		{
				        			GUI.color = Color.green;
				        		}
				        		if (script.settings.tooltip_mode != 0)
				        		{
				    				tooltip_text = "Set Terrain Size to "+current_terrain.name+" in Scene\n\n(Shift Click)";
				    			}
				        		if (GUILayout.Button(GUIContent("<Set>",tooltip_text),GUILayout.Width(75)) && key.shift){script.set_terrain_settings(current_terrain,"(siz)(con)");script.check_synchronous_terrain_size(current_terrain);}
				        		GUI.color = color_terrain;
					        	if (script.terrains.Count > 1)
					        	{
					        		if (current_terrain.tiles.x == 1 || current_terrain.tiles.y == 1)
					        		{
					        			GUI.color = Color.red;
					        		}
					        		if (script.settings.tooltip_mode != 0)
					        		{
					    				tooltip_text = "Fit all Terrains together to one big Tile\n\n(Shift Click)";
					    			}
						        	if (GUILayout.Button(GUIContent("<Fit All>",tooltip_text),GUILayout.Width(80)) && key.shift)
						        	{
						        		fit_all_terrains();
						        	}
						        	GUI.color = color_terrain;
						    	}
						    	EditorGUILayout.EndHorizontal();
				        		
				        		EditorGUILayout.BeginHorizontal();
				        		GUILayout.Space(60);
				        		EditorGUILayout.Vector3Field("Scale",current_terrain.scale);
				        		EditorGUILayout.EndHorizontal();
				        		/*
				        		EditorGUILayout.BeginHorizontal();
				        		GUILayout.Space(60);
				        		current_terrain.terrain.transform.position = EditorGUILayout.Vector3Field("Position",current_terrain.terrain.transform.position);
				        		EditorGUILayout.EndHorizontal();*/
				        	}
			        		
			        		GUILayout.Space(5);
			        	}
		        		
		        		EditorGUILayout.BeginHorizontal();
		        		GUILayout.Space(45);
		        		current_terrain.resolution_foldout = EditorGUILayout.Foldout(current_terrain.resolution_foldout,"Resolutions");
		        		EditorGUILayout.EndHorizontal();
		        		
		        		if (current_terrain.resolution_foldout)
		        		{
			        			gui_changed_old = GUI.changed;
			        		GUI.changed = false;
			        		EditorGUILayout.BeginHorizontal();
			        		GUILayout.Space(60);
			        		EditorGUILayout.LabelField("Heightmap Resolution",GUILayout.Width(135));
			        		var list: int = current_terrain.heightmap_resolution_list;
			        		list = GUILayout.HorizontalSlider(list,9,0,GUILayout.Width(210));
			        		if (GUI.changed)
			        		{
			        			if (list > 7){list = 7;}
			        		}
			        		current_terrain.heightmap_resolution_list = list;
			        		current_terrain.heightmap_resolution_list = EditorGUILayout.Popup(current_terrain.heightmap_resolution_list,script.heightmap_resolution_list,GUILayout.Width(70));
			        		EditorGUILayout.EndHorizontal();
			        		
			        		EditorGUILayout.BeginHorizontal();
			        		GUILayout.Space(60);
			        		EditorGUILayout.LabelField("Splatmap Resolution",GUILayout.Width(135));
			        		list = current_terrain.splatmap_resolution_list+1;
			        		list = GUILayout.HorizontalSlider(list,9,0,GUILayout.Width(210));
			        		if (GUI.changed)
			        		{
			        			if (list > 8){list = 8;}
			        			if (list < 1){list = 1;}
			        		}
			        		current_terrain.splatmap_resolution_list = list-1;
			        		current_terrain.splatmap_resolution_list = EditorGUILayout.Popup(current_terrain.splatmap_resolution_list,script.splatmap_resolution_list,GUILayout.Width(70));
			        		EditorGUILayout.EndHorizontal();
			        		
			        		EditorGUILayout.BeginHorizontal();
			        		GUILayout.Space(60);
			        		EditorGUILayout.LabelField("Basemap Resolution",GUILayout.Width(135));
			        		list = current_terrain.basemap_resolution_list+1;
			        		list = GUILayout.HorizontalSlider(list,9,0,GUILayout.Width(210));
			        		if (GUI.changed)
			        		{
			        			if (list > 8){list = 8;}
			        			if (list < 1){list = 1;}
			        		}
			        		current_terrain.basemap_resolution_list = list-1;
			        		current_terrain.basemap_resolution_list = EditorGUILayout.Popup(current_terrain.basemap_resolution_list,script.splatmap_resolution_list,GUILayout.Width(70));
			        		EditorGUILayout.EndHorizontal();
			        		
			        		EditorGUILayout.BeginHorizontal();
			        		GUILayout.Space(60);
			        		EditorGUILayout.LabelField("Detail Resolution",GUILayout.Width(135));
			        		list = current_terrain.detailmap_resolution_list+1;
			        		list = GUILayout.HorizontalSlider(list,9,0,GUILayout.Width(210));
			        		if (GUI.changed)
			        		{
			        			if (list < 1){list = 1;}
			        		}
			        		current_terrain.detailmap_resolution_list = list-1;
			        		current_terrain.detailmap_resolution_list = EditorGUILayout.Popup(current_terrain.detailmap_resolution_list,script.detailmap_resolution_list,GUILayout.Width(70));
			        		EditorGUILayout.EndHorizontal();
			        		
			        		EditorGUILayout.BeginHorizontal();
			        		GUILayout.Space(60);
			        		EditorGUILayout.LabelField("Detail Per Patch",GUILayout.Width(135));
			        		list = current_terrain.detail_resolution_per_patch_list;
			        		list = GUILayout.HorizontalSlider(list,0,4,GUILayout.Width(210));
			        		if (GUI.changed)
			        		{
			        			if (list < 0){list = 0;}
			        		}
			        		current_terrain.detail_resolution_per_patch_list = list;
			        		current_terrain.detail_resolution_per_patch_list = EditorGUILayout.Popup(current_terrain.detail_resolution_per_patch_list,script.detail_resolution_per_patch_list,GUILayout.Width(70));
			        		EditorGUILayout.EndHorizontal();
			        		
			        		if (GUI.changed){script.set_terrain_resolution_from_list(current_terrain);script.check_synchronous_terrain_resolutions(current_terrain);}
			        		GUI.changed = gui_changed_old;
			        		
			        		if (current_terrain.terrain)
			        		{
				        		EditorGUILayout.BeginHorizontal();
				        		GUILayout.Space(60);
				        		if (script.settings.tooltip_mode != 0)
				        		{
				    				tooltip_text = "Get Terrain Resolutions from "+current_terrain.name+" in Scene\n\n(Shift Click)";
				    			}
				        		if (GUILayout.Button(GUIContent("<Get>",tooltip_text),GUILayout.Width(75)))
				        		{
					        		script.get_terrain_settings(current_terrain,"(res)(con)");script.check_synchronous_terrain_resolutions(current_terrain);
	 					        }
				        		if (!current_terrain.resolutions_synchronous)
						        {
						        	GUI.color = Color.green;
						        }
						        if (script.settings.tooltip_mode != 0)
				        		{
				    				tooltip_text = "Set Terrain Resolutions to "+current_terrain.name+" in Scene\n\n(Shift Click)";
				    			}
				        		if (GUILayout.Button(GUIContent("<Set>",tooltip_text),GUILayout.Width(75)))
						        {
						        	if (script2)
					        		{
					        			set_pass = false;
					        			if (script2.generate)
					        			{
					        				script2.generate = false;
					        				generate_stop();
					        			}
					        			set_pass = true;
						        	}
	 					        	else {set_pass = true;}
	 					        	if (set_pass)
	 					        	{
	 					        		script.set_terrain_settings(current_terrain,"(res)(con)");
	 					        		script.check_synchronous_terrain_resolutions(current_terrain);
	 					        		if (script.generate_auto){generate_auto();}
	 					        	}
						        }
						        GUI.color = color_terrain;
						        if (script.terrains.Count > 1)
						        {
						        	if (script.settings.tooltip_mode != 0)
					        		{
					    				tooltip_text = "Set all terrains Resolutions the same as "+current_terrain.name+"\n\n(Shift Click)";
					    			}
						        	if ((GUILayout.Button(GUIContent("<Set All>",tooltip_text),GUILayout.Width(80)) && key.shift))
						        	{
						        		set_pass = false;
						        		if (script2)
							        	{
							        		set_pass = false;
							        		if (script2.generate)
							        		{
							        			script2.generate = false;
							        			generate_stop();
							        		}
							        		set_pass = true;
								        }
			 					        else {set_pass = true;}
						        			
						        		if (set_pass)
						        		{
						        			script.set_all_terrain_settings(current_terrain,"(res)");
						        			script.check_synchronous_terrain_resolutions(current_terrain);
						        			if (script.generate_auto){generate_auto();}
						        		}
						        	}
					        	}
					        	EditorGUILayout.EndHorizontal();
					        }
		        		}
		        		
		        		// terrain settings
		        		EditorGUILayout.BeginHorizontal();
		        		GUILayout.Space(45);
		        		current_terrain.settings_foldout = EditorGUILayout.Foldout(current_terrain.settings_foldout,"Settings");
		        		EditorGUILayout.EndHorizontal();
		        		
		        		if (current_terrain.settings_foldout)
		        		{
		        			EditorGUILayout.BeginHorizontal();
		        			GUILayout.Space(60);
		        			if (current_terrain.settings_editor){GUI.backgroundColor = Color.green;}
		        			if (GUILayout.Button("Editor",EditorStyles.miniButtonMid,GUILayout.Width(70)))
		        			{
		        				current_terrain.settings_editor = true;
		        				current_terrain.settings_runtime = false;
		        				script.get_terrain_parameter_settings(current_terrain);
		        			}
		        			GUI.backgroundColor = Color.white;
		        			if (current_terrain.settings_runtime){GUI.backgroundColor = Color.green;}
		        			if (GUILayout.Button("Runtime",EditorStyles.miniButtonMid,GUILayout.Width(70)))
		        			{
		        				current_terrain.settings_editor = false;
		        				current_terrain.settings_runtime = true;
		        				script.get_terrain_parameter_settings(current_terrain);
		        			}
		        			GUI.backgroundColor = Color.white;
		        			EditorGUILayout.EndHorizontal();
		        		
		        			gui_changed_old = GUI.changed;
			        		GUI.changed = false;	
			        		if (script.terrains.Count > 1)
			        		{	
				        		EditorGUILayout.BeginHorizontal();
			        			GUILayout.Space(60);	
			        			EditorGUILayout.LabelField("Apply to all Terrains",GUILayout.Width(147));
				        		current_terrain.settings_all_terrain = EditorGUILayout.Toggle(current_terrain.settings_all_terrain,GUILayout.Width(25));
				        		EditorGUILayout.EndHorizontal();
				        	}
		        			
		        			EditorGUILayout.BeginHorizontal();
		        			GUILayout.Space(60);	
		        			current_terrain.base_terrain_foldout = EditorGUILayout.Foldout(current_terrain.base_terrain_foldout,"Base Terrain");
		        			EditorGUILayout.EndHorizontal();
		        			
		        			if (current_terrain.base_terrain_foldout)
		        			{
			        			EditorGUILayout.BeginHorizontal();
				        		GUILayout.Space(75);	
				        		if (current_terrain.settings_runtime){GUI.color = Color.green;}
				        		EditorGUILayout.LabelField("Pixel Error",GUILayout.Width(147));
				        		current_terrain.heightmapPixelError = EditorGUILayout.Slider(current_terrain.heightmapPixelError,1.0,200.0);
				        		if (GUI.changed)
				        		{
				        			script.set_terrain_pixelerror(current_terrain,current_terrain.settings_all_terrain);
				        			SceneView.RepaintAll(); ;
				        		}
				        		EditorGUILayout.EndHorizontal();
				        		
				        		EditorGUILayout.BeginHorizontal();
				        		GUILayout.Space(75);	
				        		if (current_terrain.settings_runtime){GUI.color = Color.green;}
				        		EditorGUILayout.LabelField("Heightmap Max LOD",GUILayout.Width(147));
				        		current_terrain.heightmapMaximumLOD = EditorGUILayout.Slider(current_terrain.heightmapMaximumLOD,0,10);
				        		if (GUI.changed)
				        		{
				        			script.set_terrain_heightmap_lod(current_terrain,current_terrain.settings_all_terrain);
				        			SceneView.RepaintAll(); ;
				        		}
				        		EditorGUILayout.EndHorizontal();
				        		
				        		EditorGUILayout.BeginHorizontal();
				        		GUILayout.Space(75);	
				        		EditorGUILayout.LabelField("Basemap Distance",GUILayout.Width(147));
				        		GUI.changed = false;
				        		if (current_terrain.settings_editor){current_terrain.basemapDistance = EditorGUILayout.Slider(current_terrain.basemapDistance,1.0,script.settings.editor_basemap_distance_max);}
				        			else {current_terrain.basemapDistance = EditorGUILayout.Slider(current_terrain.basemapDistance,1.0,script.settings.runtime_basemap_distance_max);}
				        		if (GUI.changed)
				        		{
				        			script.set_terrain_basemap_distance(current_terrain,current_terrain.settings_all_terrain);
				        			SceneView.RepaintAll(); 
				        		}
				        		EditorGUILayout.EndHorizontal();
				        		
				        		EditorGUILayout.BeginHorizontal();
				        		GUILayout.Space(75);		
				        		EditorGUILayout.LabelField("Cast Shadows",GUILayout.Width(147));
				        		GUI.changed = false;
				        		current_terrain.castShadows = EditorGUILayout.Toggle(current_terrain.castShadows,GUILayout.Width(25));
				        		if (GUI.changed)
				        		{
				        			script.set_terrain_shadow(current_terrain,current_terrain.settings_all_terrain);
				        			SceneView.RepaintAll(); 
				        		}
				        		
				        		EditorGUILayout.EndHorizontal();
				        	}
			        		GUI.changed = gui_changed_old;
			        		
			        		EditorGUILayout.BeginHorizontal();
		        			GUILayout.Space(60);	
		        			if (current_terrain.settings_runtime)
				        	{
				        		if (script.settings.color_scheme){GUI.color = color_terrain;} else {GUI.color = Color.white;}
				        	}
		        			current_terrain.tree_detail_objects_foldout = EditorGUILayout.Foldout(current_terrain.tree_detail_objects_foldout,"Tree & Detail Terrain");
		        			if (current_terrain.settings_runtime)
				        	{
				        		GUI.color = Color.green;
				        	}
		        			EditorGUILayout.EndHorizontal();
		        			
		        			if (current_terrain.tree_detail_objects_foldout)
		        			{
			        			EditorGUILayout.BeginHorizontal();
				        		GUILayout.Space(75);		
				        		EditorGUILayout.LabelField("Draw",GUILayout.Width(147));
				        		GUI.changed = false;
				        		current_terrain.draw = EditorGUILayout.Toggle(current_terrain.draw,GUILayout.Width(25));
				        		if (GUI.changed)
				        		{
				        			script.set_terrain_draw(current_terrain,current_terrain.settings_all_terrain,current_terrain.draw);
				        			SceneView.RepaintAll(); 
				        		}
				        		EditorGUILayout.EndHorizontal();
				        		
				        		EditorGUILayout.BeginHorizontal();
				        		GUILayout.Space(75);	
				        		EditorGUILayout.LabelField("Detail Distance",GUILayout.Width(147));
				        		GUI.changed = false;
				        		if (current_terrain.settings_editor){current_terrain.detailObjectDistance = EditorGUILayout.Slider(current_terrain.detailObjectDistance,0,script.settings.editor_detail_distance_max);}
				        			else {current_terrain.detailObjectDistance = EditorGUILayout.Slider(current_terrain.detailObjectDistance,0,script.settings.runtime_detail_distance_max);}
				        		if (GUI.changed)
				        		{
				        			script.set_terrain_detail_distance(current_terrain,current_terrain.settings_all_terrain);
				        			SceneView.RepaintAll(); 
				        		}
				        		EditorGUILayout.EndHorizontal();
				        		
				        		EditorGUILayout.BeginHorizontal();
				        		GUILayout.Space(75);	
				        		EditorGUILayout.LabelField("Detail Density",GUILayout.Width(147));
				        		GUI.changed = false;
				        		current_terrain.detailObjectDensity = EditorGUILayout.Slider(current_terrain.detailObjectDensity,0.0,1.0);
				        		if (GUI.changed)
				        		{
				        			script.set_terrain_detail_density(current_terrain,current_terrain.settings_all_terrain);
				        			SceneView.RepaintAll(); 
				        		}
				        		EditorGUILayout.EndHorizontal();
				        		
				        		GUILayout.Space(2);
				        		
				        		EditorGUILayout.BeginHorizontal();
				        		GUILayout.Space(75);	
				        		EditorGUILayout.LabelField("Tree Distance",GUILayout.Width(147));
				        		GUI.changed = false;
				        		if (current_terrain.settings_editor){current_terrain.treeDistance = EditorGUILayout.Slider(current_terrain.treeDistance,0,script.settings.editor_tree_distance_max);}
				        			else {current_terrain.treeDistance = EditorGUILayout.Slider(current_terrain.treeDistance,0,script.settings.runtime_tree_distance_max);}
				        		if (GUI.changed)
				        		{
				        			script.set_terrain_tree_distance(current_terrain,current_terrain.settings_all_terrain);
				        			SceneView.RepaintAll(); 
				        		}
				        		EditorGUILayout.EndHorizontal();
				        		
				        		EditorGUILayout.BeginHorizontal();
				        		GUILayout.Space(75);	
				        		EditorGUILayout.LabelField("Billboard Start",GUILayout.Width(147));
				        		GUI.changed = false;
				        		current_terrain.treeBillboardDistance = EditorGUILayout.Slider(current_terrain.treeBillboardDistance,0,2000);
				        		if (GUI.changed)
				        		{
				        			script.set_terrain_tree_billboard_distance(current_terrain,current_terrain.settings_all_terrain);
				        			SceneView.RepaintAll(); 
				        		}
				        		EditorGUILayout.EndHorizontal();
				        		
				        		EditorGUILayout.BeginHorizontal();
				        		GUILayout.Space(75);	
				        		EditorGUILayout.LabelField("Fade Length",GUILayout.Width(147));
				        		GUI.changed = false;
				        		if (current_terrain.settings_editor){current_terrain.treeCrossFadeLength = EditorGUILayout.Slider(current_terrain.treeCrossFadeLength,0,script.settings.editor_fade_length_max);}
				        			else {current_terrain.treeCrossFadeLength = EditorGUILayout.Slider(current_terrain.treeCrossFadeLength,0,script.settings.runtime_fade_length_max);}
				        		if (GUI.changed)
				        		{
				        			script.set_terrain_tree_billboard_fade_length(current_terrain,current_terrain.settings_all_terrain);
				        			SceneView.RepaintAll(); 
				        		}
				        		EditorGUILayout.EndHorizontal();
				        		
				        		EditorGUILayout.BeginHorizontal();
				        		GUILayout.Space(75);	
				        		EditorGUILayout.LabelField("Max Mesh Trees",GUILayout.Width(147));
				        		GUI.changed = false;
				        		if (current_terrain.settings_editor){current_terrain.treeMaximumFullLODCount = EditorGUILayout.Slider(current_terrain.treeMaximumFullLODCount,0,script.settings.editor_mesh_trees_max);}
				        			else {current_terrain.treeMaximumFullLODCount = EditorGUILayout.Slider(current_terrain.treeMaximumFullLODCount,0,script.settings.runtime_mesh_trees_max);}
				        		if (GUI.changed)
				        		{
				        			script.set_terrain_tree_max_mesh(current_terrain,current_terrain.settings_all_terrain);
				        			SceneView.RepaintAll(); 
				        		}
				        		EditorGUILayout.EndHorizontal();
				        	}
			        		if (current_terrain.settings_runtime)
				        	{
				        		if (script.settings.color_scheme){GUI.color = color_terrain;} else {GUI.color = Color.white;}
				        	}
			        		
			        		EditorGUILayout.BeginHorizontal();
		        			GUILayout.Space(60);	
		        			current_terrain.wind_settings_foldout = EditorGUILayout.Foldout(current_terrain.wind_settings_foldout,"Wind Settings");
		        			EditorGUILayout.EndHorizontal();
		        			
		        			if (current_terrain.wind_settings_foldout)
		        			{
		        				EditorGUILayout.BeginHorizontal();
				        		GUILayout.Space(75);	
				        		EditorGUILayout.LabelField("Speed",GUILayout.Width(147));
				        		GUI.changed = false;
				        		current_terrain.wavingGrassStrength = EditorGUILayout.Slider(current_terrain.wavingGrassStrength,0.0,1.0);
				        		if (GUI.changed)
				        		{
				        			script.set_terrain_wind_bending(current_terrain,current_terrain.settings_all_terrain);
				        		}
				        		EditorGUILayout.EndHorizontal();
		        			}
		        			
		        			if (current_terrain.wind_settings_foldout)
		        			{
		        				EditorGUILayout.BeginHorizontal();
				        		GUILayout.Space(75);	
				        		EditorGUILayout.LabelField("Size",GUILayout.Width(147));
				        		GUI.changed = false;
				        		current_terrain.wavingGrassSpeed = EditorGUILayout.Slider(current_terrain.wavingGrassSpeed,0.0,1.0);
				        		if (GUI.changed)
				        		{
				        			script.set_terrain_wind_speed(current_terrain,current_terrain.settings_all_terrain);
				        		}
				        		EditorGUILayout.EndHorizontal();
		        			}
		        			
		        			if (current_terrain.wind_settings_foldout)
		        			{
		        				EditorGUILayout.BeginHorizontal();
				        		GUILayout.Space(75);	
				        		EditorGUILayout.LabelField("Bending",GUILayout.Width(147));
				        		GUI.changed = false;
				        		current_terrain.wavingGrassAmount = EditorGUILayout.Slider(current_terrain.wavingGrassAmount,0.0,1.0);
				        		if (GUI.changed)
				        		{
				        			script.set_terrain_wind_amount(current_terrain,current_terrain.settings_all_terrain);
				        		}
				        		EditorGUILayout.EndHorizontal();
		        			}
		        			
		        			if (current_terrain.wind_settings_foldout)
		        			{
		        				EditorGUILayout.BeginHorizontal();
				        		GUILayout.Space(75);	
				        		EditorGUILayout.LabelField("Grass Tint",GUILayout.Width(147));
				        		GUI.changed = false;
				        		current_terrain.wavingGrassTint = EditorGUILayout.ColorField(current_terrain.wavingGrassTint);
				        		if (GUI.changed)
				        		{
				        			script.set_terrain_grass_tint(current_terrain,current_terrain.settings_all_terrain);
				        			SceneView.RepaintAll(); 
				        		}
				        		EditorGUILayout.EndHorizontal();
		        			}
						}
		        		
		        		// terrain splat
		        		EditorGUILayout.BeginHorizontal();
		        		GUILayout.Space(45);
		        		current_terrain.splat_foldout = EditorGUILayout.Foldout(current_terrain.splat_foldout,"Splat Textures");
		        		EditorGUILayout.EndHorizontal();
		        		
		        		if (current_terrain.splat_foldout)
		        		{
		        			EditorGUILayout.BeginHorizontal();
		        			GUILayout.Space(60);
		        			if (!script.color_output)
		        			{
			        			if (script.settings.tooltip_mode != 0)
						        {
						    		tooltip_text = "Add a new Splat Texture";
						    	}
			        			if (GUILayout.Button(GUIContent("+",tooltip_text),GUILayout.Width(25)))
			        			{
			        				if (script.settings.triplanar)
						            {
						            	if (current_terrain.splatPrototypes.Count > 7)
						            	{
						            		this.ShowNotification(GUIContent("Cannot create more then 8 splat textures with the TriPlanar shader"));
						            		return;
						            	}
						            }
			        				current_terrain.add_splatprototype(current_terrain.splatPrototypes.Count);
			        				if (key.shift)
				        			{
				        				script.copy_terrain_splat(current_terrain.splatPrototypes[current_terrain.splatPrototypes.Count-2],current_terrain.splatPrototypes[current_terrain.splatPrototypes.Count-1]);
				        				script.check_synchronous_terrain_splat_textures(current_terrain);
				        			}
				        			script.check_synchronous_terrain_splat_textures(current_terrain);
			        			}
			        			if (script.settings.tooltip_mode != 0)
						        {
						    		tooltip_text = "Erase the last Splat Texture\n\n(Control Click)";
						    	}
			        			if (GUILayout.Button(GUIContent("-",tooltip_text),GUILayout.Width(25)))
			        			{
			        				if (!key.shift)
			        				{
			        					Undo.RegisterUndo(script,"Splat Erase");
		    							current_terrain.erase_splatprototype(current_terrain.splatPrototypes.Count-1);
		    						}
		    						else
		    						{
		    							Undo.RegisterUndo(script,"Splats Erase");
		    							current_terrain.clear_splatprototype();
		    						}
			        				this.Repaint();
			        				return;
			        			}
			        		}
		        			if (script.settings.tooltip_mode != 0)
					        {
					    		tooltip_text = "Fold/Unfold all Splat settings\n(Click)\n\nInvert Foldout all Splat settings\n(Shift Click)";
					    	}
		        			if (GUILayout.Button(GUIContent("F",tooltip_text),GUILayout.Width(20)))
		        			{
		        				current_terrain.splats_foldout = !current_terrain.splats_foldout;
		        				if (!script.color_output)
		        				{
		        					script.change_splats_settings_foldout(current_terrain,key.shift);
		        				}
		        				else
		        				{
		        					script.change_color_splats_settings_foldout(current_terrain,key.shift);
		        				}
		        			}
		        			/*
		        			if (script.settings.tooltip_mode != 0)
					        {
					    		tooltip_text = "Enable/Disable TriPlanar Shader\n(Shift Click)";
					    	}
		        			if (script.settings.triplanar){GUI.backgroundColor = Color.green;}
		        			if (GUILayout.Button(GUIContent("<TriPlanar>",tooltip_text),GUILayout.Width(85)) && key.shift)
		        			{
		        				script.settings.triplanar = !script.settings.triplanar;
		        				triplanar_shader(script.settings.triplanar);
		        				script.set_all_terrain_splat_textures(current_terrain,false);
		        			}
		        			if (script.settings.triplanar){GUI.backgroundColor = Color.white;}
		        			*/
		        			
		        			if (!script.color_output)
		        			{
			        			if (script.settings.colormap){GUI.backgroundColor = Color.green;}
			        			if (GUILayout.Button(GUIContent("<Colormap>",tooltip_text),GUILayout.Width(85)) && key.shift)
			        			{
			        				script.settings.colormap = !script.settings.colormap;
			        				init_colormap();
			        				script.set_colormap(script.settings.colormap);
			        				script.check_synchronous_terrains_splat_textures();
			        			}
			        			if (script.settings.colormap){GUI.backgroundColor = Color.white;}
			        			EditorGUILayout.EndHorizontal();
			        			
			        			EditorGUILayout.BeginHorizontal();
							    GUILayout.Space(60);
					        	EditorGUILayout.LabelField("Apply settings to all terrains",GUILayout.Width(160));
					        	script.settings.splat_apply_all = EditorGUILayout.Toggle(script.settings.splat_apply_all,GUILayout.Width(25));
			        		}
		        			EditorGUILayout.EndHorizontal();
		        			
		        			gui_changed_old = GUI.changed;
		        			GUI.changed = false;
		        			var count_splat: int;
		        			
		        			if (!script.color_output)
		        			{
			        			for (count_splat = 0;count_splat < current_terrain.splatPrototypes.Count;++count_splat)
			        			{
			        				if (count_splat == 0 && script.settings.triplanar)
			        				{
				        				EditorGUILayout.BeginHorizontal();
						        		GUILayout.Space(80);
				        				EditorGUILayout.LabelField("Splat",GUILayout.Width(55));
				        				
				        				if (script.settings.triplanar)
				        				{
					        				EditorGUILayout.LabelField("Normal",GUILayout.Width(55));
					        				EditorGUILayout.LabelField("Specular",GUILayout.Width(55));
					        			}
				        				
				        				EditorGUILayout.EndHorizontal();
				        			}
			        				
			        				EditorGUILayout.BeginHorizontal();
					        		GUILayout.Space(60);
					        		EditorGUILayout.LabelField(""+count_splat+".",GUILayout.Width(16));
			        				current_terrain.splatPrototypes[count_splat].texture = EditorGUILayout.ObjectField(current_terrain.splatPrototypes[count_splat].texture,Texture,true,GUILayout.Width(55),GUILayout.Height(55));
			        				if (script.settings.triplanar)
			        				{
			        					current_terrain.splatPrototypes[count_splat].normal_texture = EditorGUILayout.ObjectField(current_terrain.splatPrototypes[count_splat].normal_texture,Texture,true,GUILayout.Width(55),GUILayout.Height(55));
			        					current_terrain.splatPrototypes[count_splat].specular_texture = EditorGUILayout.ObjectField(current_terrain.splatPrototypes[count_splat].specular_texture,Texture,true,GUILayout.Width(55),GUILayout.Height(55));
			        				}
			        				
			        				if (!script.settings.colormap || count_splat != 0)
			        				{
				        				if (script.settings.tooltip_mode != 0)
								        {
								    		tooltip_text = "Swap Splat Texture with previous";
								    	}
				        				if (GUILayout.Button(GUIContent("<",tooltip_text),GUILayout.Width(25)) && count_splat > 0){script.swap_terrain_splat(current_terrain,count_splat,count_splat-1);script.check_synchronous_terrain_splat_textures(current_terrain);}		 
							           	if (script.settings.tooltip_mode != 0)
								        {
								    		tooltip_text = "Swap Splat Texture with next";
								    	}
				        				if (GUILayout.Button(GUIContent(">",tooltip_text),GUILayout.Width(25)) && count_splat < current_terrain.splatPrototypes.Count-1){script.swap_terrain_splat(current_terrain,count_splat,count_splat+1);script.check_synchronous_terrain_splat_textures(current_terrain);}		 
							            if (script.settings.tooltip_mode != 0)
								        {
								    		tooltip_text = "Insert a new Splat Texture";
								    	}
							            if (GUILayout.Button(GUIContent("+",tooltip_text),GUILayout.Width(25)))
							            {
							            	if (script.settings.triplanar)
							            	{
							            		if (current_terrain.splatPrototypes.Count > 7)
							            		{
							            			this.ShowNotification(GUIContent("Cannot create more then 8 splat textures with the TriPlanar shader"));
							            			return;
							            		}
							            	}
							            	
							            	current_terrain.add_splatprototype(count_splat+1);
					        				if (key.shift)
					        				{
					        					script.copy_terrain_splat(current_terrain.splatPrototypes[count_splat],current_terrain.splatPrototypes[count_splat+1]);
					        				}
					        				script.check_synchronous_terrain_splat_textures(current_terrain);
							            } 
							            if (script.settings.tooltip_mode != 0)
								        {
								    		tooltip_text = "Erase this Splat Texture\n\n(Control Click)";
								    	}	
							        	if (GUILayout.Button(GUIContent("-",tooltip_text),GUILayout.Width(25)) && key.control)
							        	{
							        		Undo.RegisterUndo(script,"Splat Erase");
			    							current_terrain.erase_splatprototype(count_splat);
			    							script.check_synchronous_terrain_splat_textures(current_terrain);
							        		this.Repaint();
							        		return;
							        	}
						        		EditorGUILayout.EndHorizontal();
						        		
						        		EditorGUILayout.BeginHorizontal();
						        		GUILayout.Space(80);
				        				
				        				if (current_terrain.splatPrototypes[count_splat].texture){EditorGUILayout.LabelField(""+current_terrain.splatPrototypes[count_splat].texture.name,GUILayout.Width(205));}
				        					else {EditorGUILayout.LabelField("Empty",GUILayout.Width(55));}
				        				
				        				if (script.settings.triplanar)
				        				{
					        				if (current_terrain.splatPrototypes[count_splat].normal_texture){EditorGUILayout.LabelField(""+current_terrain.splatPrototypes[count_splat].normal_texture.name,GUILayout.Width(55));}
					        					else {EditorGUILayout.LabelField("Empty",GUILayout.Width(55));}
					        				if (current_terrain.splatPrototypes[count_splat].specular_texture){EditorGUILayout.LabelField(""+current_terrain.splatPrototypes[count_splat].specular_texture.name,GUILayout.Width(55));}
					        					else {EditorGUILayout.LabelField("Empty",GUILayout.Width(55));}
					        			}
				        				
				        				EditorGUILayout.EndHorizontal();
				        				
				        				EditorGUILayout.BeginHorizontal();
						        		GUILayout.Space(79);
						        		current_terrain.splatPrototypes[count_splat].foldout = EditorGUILayout.Foldout(current_terrain.splatPrototypes[count_splat].foldout,"Settings");
						        		EditorGUILayout.EndHorizontal();
						        		if (GUI.changed)
										{
											script.check_synchronous_terrain_splat_textures(current_terrain);
										}
										GUI.changed = gui_changed_old;
						        		
				        				if (current_terrain.splatPrototypes[count_splat].foldout)
				        				{
				        					if (!script.settings.triplanar)
				        					{
					        					GUI.changed = gui_changed_old;
					        					GUI.changed = false;
					        					EditorGUILayout.BeginHorizontal();
								        		GUILayout.Space(94);
								        		EditorGUILayout.LabelField("Tile Size",GUILayout.Width(100));
								        		current_terrain.splatPrototypes[count_splat].tileSize.x = EditorGUILayout.Slider(current_terrain.splatPrototypes[count_splat].tileSize.x,1,2000);
									        	current_terrain.splatPrototypes[count_splat].tileSize.y = current_terrain.splatPrototypes[count_splat].tileSize.x;
								        		/*
								        		EditorGUILayout.LabelField("X",GUILayout.Width(30));
								        		GUI.SetNextControlName("tile_x"+count_splat);
								        		current_terrain.splatPrototypes[count_splat].tileSize.x = EditorGUILayout.FloatField(current_terrain.splatPrototypes[count_splat].tileSize.x,GUILayout.Width(70));
						        				EditorGUILayout.LabelField("Y",GUILayout.Width(30));
						        				GUI.SetNextControlName("tile_y"+count_splat);
								        		current_terrain.splatPrototypes[count_splat].tileSize.y = EditorGUILayout.FloatField(current_terrain.splatPrototypes[count_splat].tileSize.y,GUILayout.Width(70));
								        		current_terrain.splatPrototypes[count_splat].tileSize_link = EditorGUILayout.Toggle(current_terrain.splatPrototypes[count_splat].tileSize_link,GUILayout.Width(25));
								        		if (current_terrain.splatPrototypes[count_splat].tileSize_link){current_terrain.splatPrototypes[count_splat].tileSize.y = current_terrain.splatPrototypes[count_splat].tileSize.x;}
								        		*/
						        				EditorGUILayout.EndHorizontal();
												
												EditorGUILayout.BeginHorizontal();
								        		GUILayout.Space(94);
								        		EditorGUILayout.LabelField("Tile Offset",GUILayout.Width(100));
								        		EditorGUILayout.LabelField("X",GUILayout.Width(30));
								        		current_terrain.splatPrototypes[count_splat].tileOffset.x = EditorGUILayout.FloatField(current_terrain.splatPrototypes[count_splat].tileOffset.x,GUILayout.Width(70));
												EditorGUILayout.LabelField("Y",GUILayout.Width(30));
								        		current_terrain.splatPrototypes[count_splat].tileOffset.y = EditorGUILayout.FloatField(current_terrain.splatPrototypes[count_splat].tileOffset.y,GUILayout.Width(70));
												EditorGUILayout.EndHorizontal();
												if (GUI.changed)
												{
													if (!script.settings.splat_apply_all)
													{
														script.set_terrain_splat_textures(current_terrain,current_terrain);
													}
													else
													{
														script.set_all_terrain_splat_textures(current_terrain,true,false);
													}
													SceneView.RepaintAll();
												}
												GUI.changed = gui_changed_old;
											}
											else
											{
												GUI.changed = gui_changed_old;
					        					GUI.changed = false;
					        					
					        					if (script.settings.colormap && count_splat != 0)
					        					{
						        					EditorGUILayout.BeginHorizontal();
									        		GUILayout.Space(94);
									        		EditorGUILayout.LabelField("Splat Tile Size",GUILayout.Width(100));
									        		current_terrain.splatPrototypes[count_splat].tileSize.x = EditorGUILayout.Slider(current_terrain.splatPrototypes[count_splat].tileSize.x,1,2000);
									        		current_terrain.splatPrototypes[count_splat].tileSize.y = current_terrain.splatPrototypes[count_splat].tileSize.x;
							        				EditorGUILayout.EndHorizontal();
												}	
													EditorGUILayout.BeginHorizontal();
									        		GUILayout.Space(94);
									        		EditorGUILayout.LabelField("Normal Tile Size",GUILayout.Width(100));
									        		current_terrain.splatPrototypes[count_splat].normal_tileSize.x = EditorGUILayout.Slider(current_terrain.splatPrototypes[count_splat].normal_tileSize.x,1,2000);
									        		current_terrain.splatPrototypes[count_splat].normal_tileSize.y = current_terrain.splatPrototypes[count_splat].normal_tileSize.x;
							        				EditorGUILayout.EndHorizontal();
							        			
												
												EditorGUILayout.BeginHorizontal();
								        		GUILayout.Space(94);
								        		EditorGUILayout.LabelField("Splat Light",GUILayout.Width(100));
								        		current_terrain.splatPrototypes[count_splat].strength_splat = EditorGUILayout.Slider(current_terrain.splatPrototypes[count_splat].strength_splat,0,2);
								        		EditorGUILayout.EndHorizontal();
												
												EditorGUILayout.BeginHorizontal();
								        		GUILayout.Space(94);
								        		EditorGUILayout.LabelField("Normal Light",GUILayout.Width(100));
								        		current_terrain.splatPrototypes[count_splat].strength = EditorGUILayout.Slider(current_terrain.splatPrototypes[count_splat].strength,0,2);
								        		
								        		if (GUI.changed)
												{
													script.set_terrain_splat_textures(current_terrain,current_terrain);
													SceneView.RepaintAll();
												}
												GUI.changed = gui_changed_old;
												EditorGUILayout.EndHorizontal();
											}
										}}
										else
										{
											EditorGUILayout.EndHorizontal();
										}
									
								}
								
							}
							else
							{
								for (count_splat = 0;count_splat < 3;++count_splat)
			        			{
			        				EditorGUILayout.BeginHorizontal();
					        		GUILayout.Space(60);
					        		EditorGUILayout.LabelField(""+count_splat+".",GUILayout.Width(16));
			        				script.settings.color_splatPrototypes[count_splat].texture = EditorGUILayout.ObjectField(script.settings.color_splatPrototypes[count_splat].texture,Texture,true,GUILayout.Width(55),GUILayout.Height(55));
			        				EditorGUILayout.EndHorizontal();
					        		
			        				
			        				EditorGUILayout.BeginHorizontal();
					        		GUILayout.Space(79);
					        		script.settings.color_splatPrototypes[count_splat].foldout = EditorGUILayout.Foldout(script.settings.color_splatPrototypes[count_splat].foldout,"Settings");
					        		EditorGUILayout.EndHorizontal();
					        		if (GUI.changed)
									{
										script.check_synchronous_terrain_splat_textures(current_terrain);
									}
									GUI.changed = gui_changed_old;
					        		
			        				if (script.settings.color_splatPrototypes[count_splat].foldout)
			        				{
			        					if (!script.settings.triplanar)
			        					{
				        					GUI.changed = gui_changed_old;
				        					GUI.changed = false;
				        					EditorGUILayout.BeginHorizontal();
							        		GUILayout.Space(94);
							        		EditorGUILayout.LabelField("Tile Size",GUILayout.Width(100));
							        		script.settings.color_splatPrototypes[count_splat].tileSize.x = EditorGUILayout.Slider(script.settings.color_splatPrototypes[count_splat].tileSize.x,1,2000);
								        	script.settings.color_splatPrototypes[count_splat].tileSize.y = script.settings.color_splatPrototypes[count_splat].tileSize.x;
							        		/*
							        		EditorGUILayout.LabelField("X",GUILayout.Width(30));
							        		GUI.SetNextControlName("tile_x"+count_splat);
							        		current_terrain.splatPrototypes[count_splat].tileSize.x = EditorGUILayout.FloatField(current_terrain.splatPrototypes[count_splat].tileSize.x,GUILayout.Width(70));
					        				EditorGUILayout.LabelField("Y",GUILayout.Width(30));
					        				GUI.SetNextControlName("tile_y"+count_splat);
							        		current_terrain.splatPrototypes[count_splat].tileSize.y = EditorGUILayout.FloatField(current_terrain.splatPrototypes[count_splat].tileSize.y,GUILayout.Width(70));
							        		current_terrain.splatPrototypes[count_splat].tileSize_link = EditorGUILayout.Toggle(current_terrain.splatPrototypes[count_splat].tileSize_link,GUILayout.Width(25));
							        		if (current_terrain.splatPrototypes[count_splat].tileSize_link){current_terrain.splatPrototypes[count_splat].tileSize.y = current_terrain.splatPrototypes[count_splat].tileSize.x;}
							        		*/
					        				EditorGUILayout.EndHorizontal();
											
											EditorGUILayout.BeginHorizontal();
							        		GUILayout.Space(94);
							        		EditorGUILayout.LabelField("Tile Offset",GUILayout.Width(100));
							        		EditorGUILayout.LabelField("X",GUILayout.Width(30));
							        		script.settings.color_splatPrototypes[count_splat].tileOffset.x = EditorGUILayout.FloatField(script.settings.color_splatPrototypes[count_splat].tileOffset.x,GUILayout.Width(70));
											EditorGUILayout.LabelField("Y",GUILayout.Width(30));
							        		script.settings.color_splatPrototypes[count_splat].tileOffset.y = EditorGUILayout.FloatField(script.settings.color_splatPrototypes[count_splat].tileOffset.y,GUILayout.Width(70));
											EditorGUILayout.EndHorizontal();
											if (GUI.changed)
											{
												for (var count_splat2: int = 0;count_splat2 < 3;++count_splat2)
												{
													script.settings.color_splatPrototypes[count_splat2].tileSize = script.settings.color_splatPrototypes[count_splat].tileSize;
													script.settings.color_splatPrototypes[count_splat2].tileOffset = script.settings.color_splatPrototypes[count_splat].tileOffset;
												}
												
												if (script.settings.splat_apply_all)
												{
													script.set_all_terrain_color_textures(false);
												}
												else
												{
													script.set_terrain_color_textures(current_terrain);
												}
												SceneView.RepaintAll();
											}
											GUI.changed = gui_changed_old;
										}
									}
								}
							}
							
							if (current_terrain.terrain)
							{							
			        			EditorGUILayout.BeginHorizontal();
					        	GUILayout.Space(60);
					        	if (!script.color_output)
					        	{
						        	if (script.settings.tooltip_mode != 0)
						        	{
						    			tooltip_text = "Get Splat Textures from "+current_terrain.name+" in Scene\n\n(Shift Click)";
						    		}
						        	if (GUILayout.Button(GUIContent("<Get>",tooltip_text),GUILayout.Width(75)) && key.shift)
						        	{
						        		script.get_terrain_splat_textures(current_terrain);script.check_synchronous_terrain_splat_textures(current_terrain);
						        	}
						        }
					        	if (!current_terrain.splat_synchronous)
					        	{
					        		GUI.color = Color.green;
					        	}
					        	if (script.settings.tooltip_mode != 0)
					        	{
					    			tooltip_text = "Set Splat Textures to "+current_terrain.name+" in Scene\n\n(Shift Click)";
					    		}
					        	if (GUILayout.Button(GUIContent("<Set>",tooltip_text),GUILayout.Width(75)) && key.shift)
					        	{
					        		if (!script.color_output)
						        	{
						        		script.set_terrain_splat_textures(current_terrain,current_terrain);
						        		script.check_synchronous_terrain_splat_textures(current_terrain);
						        	}
						        	else
						        	{
						        		script.set_terrain_color_textures(current_terrain);
						        		script.check_synchronous_terrain_color_textures(current_terrain);
						        	}
						        	assign_terrain_splat_alpha(current_terrain);
						        	update_terrain_asset(current_terrain);
					        	}
					        	GUI.color = color_terrain;
					        	if (script.terrains.Count > 1)
			        			{
					        		if (script.settings.tooltip_mode != 0)
						        	{
						    			tooltip_text = "Set all terrains Splat Textures the same as "+current_terrain.name+"\n\n(Shift Click)";
						    		}
					        		if (GUILayout.Button(GUIContent("<Set All>",tooltip_text),GUILayout.Width(75)) && key.shift)
					        		{
					        			if (!script.color_output)
					        			{
					        				script.set_all_terrain_splat_textures(current_terrain,true,true);
					        				script.check_synchronous_terrains_splat_textures();
					        			}
					        			else
					        			{
					        				script.set_all_terrain_color_textures(true);		
					        				script.check_synchronous_terrains_color_textures();
					        			}
					        			assign_all_terrain_splat_alpha();
					        			update_all_terrain_asset();
					        		}
					        	}
					        	EditorGUILayout.EndHorizontal();
					        }
				        }
		        	
		        		EditorGUILayout.BeginHorizontal();
		        		GUILayout.Space(45);
		        		current_terrain.tree_foldout = EditorGUILayout.Foldout(current_terrain.tree_foldout,"Trees");
		        		EditorGUILayout.EndHorizontal();
		        		
		        		if (current_terrain.tree_foldout)
		        		{
		        			EditorGUILayout.BeginHorizontal();
		        			GUILayout.Space(60);
		        			if (script.settings.tooltip_mode != 0)
					        {
					    		tooltip_text = "Add a new Tree";
					    	}
		        			if (GUILayout.Button(GUIContent("+",tooltip_text),GUILayout.Width(25)))
		        			{
		        				current_terrain.add_treeprototype(current_terrain.treePrototypes.Count);
		        				if (key.shift)
			        			{
			        				script.copy_terrain_tree(current_terrain.treePrototypes[current_terrain.treePrototypes.Count-2],current_terrain.treePrototypes[current_terrain.treePrototypes.Count-1]);
			        			}
			        			script.check_synchronous_terrain_trees(current_terrain);
		        			}
		        			if (script.settings.tooltip_mode != 0)
					        {
					    		tooltip_text = "Erase the last Tree\n\n(Control Click)";
					    	}
		        			if (GUILayout.Button(GUIContent("-",tooltip_text),GUILayout.Width(25)))
		        			{
		        				if (!key.shift)
		        				{
		        					Undo.RegisterUndo(script,"Tree Erase");
	    							current_terrain.erase_treeprototype(current_terrain.treePrototypes.Count-1);
	    						}
	    						else
	    						{
	    							Undo.RegisterUndo(script,"Tree Erase");
	    							current_terrain.clear_treeprototype();
	    						}
	    						script.check_synchronous_terrain_trees(current_terrain);
		        				this.Repaint();
		        				return;
		        			}
		        			if (script.settings.tooltip_mode != 0)
					        {
					    		tooltip_text = "Fold/Unfold all Trees settings\n(Click)\n\nInvert Foldout all Trees settings\n(Shift Click)";
					    	}
		        			if (GUILayout.Button(GUIContent("F",tooltip_text),GUILayout.Width(20)))
		        			{
		        				current_terrain.trees_foldout = !current_terrain.trees_foldout;
		        				script.change_trees_settings_foldout(current_terrain,key.shift);
		        			}
		        			
		        			EditorGUILayout.EndHorizontal();
		        			for (count_tree = 0;count_tree < current_terrain.treePrototypes.Count;++count_tree)
		        			{
		        				EditorGUILayout.BeginHorizontal();
				        		GUILayout.Space(60);
				        		
				        		if (!current_terrain.treePrototypes[count_tree].prefab){GUILayout.Button(GUIContent("Empty"),EditorStyles.miniButtonMid,GUILayout.Width(64),GUILayout.Height(64));}
				        		else
				        		{
									#if !UNITY_3_4 && !UNITY_3_5
								    current_terrain.treePrototypes[count_tree].texture = AssetPreview.GetAssetPreview(current_terrain.treePrototypes[count_tree].prefab);
									#else
								    current_terrain.treePrototypes[count_tree].texture = EditorUtility.GetAssetPreview(current_terrain.treePrototypes[count_tree].prefab);
								    #endif
								    if (script.settings.tooltip_mode == 2)
									{
										tooltip_text = "Click to preview\n\nClick again to close preview";
									} else {tooltip_text = "";}
								    if (GUILayout.Button(GUIContent(current_terrain.treePrototypes[count_tree].texture,tooltip_text),EditorStyles.miniButtonMid,GUILayout.Width(64),GUILayout.Height(64))){create_preview_window(current_terrain.treePrototypes[count_tree].texture,"Tree Preview");}
						    	}
		        				
				        		EditorGUILayout.LabelField(""+count_tree+".",GUILayout.Width(20));
				        		gui_changed_old = GUI.changed;
				        		GUI.changed = false;
		        				current_terrain.treePrototypes[count_tree].prefab = EditorGUILayout.ObjectField(current_terrain.treePrototypes[count_tree].prefab,GameObject,true,GUILayout.Width(250));
		        				if (script.settings.tooltip_mode != 0)
						        {
						    		tooltip_text = "Swap Tree with previous";
						    	}
		        				if (GUILayout.Button(GUIContent("<",tooltip_text),GUILayout.Width(25)) && count_tree > 0){script.swap_terrain_tree(current_terrain,count_tree,count_tree-1);script.check_synchronous_terrain_trees(current_terrain);}		 
					           	if (script.settings.tooltip_mode != 0)
						        {
						    		tooltip_text = "Swap Tree with next";
						    	}
					           	if (GUILayout.Button(GUIContent(">",tooltip_text),GUILayout.Width(25)) && count_tree < current_terrain.treePrototypes.Count-1){script.swap_terrain_tree(current_terrain,count_tree,count_tree+1);script.check_synchronous_terrain_trees(current_terrain);}		 
					            if (script.settings.tooltip_mode != 0)
						        {
						    		tooltip_text = "Insert a new Tree";
						    	}
					            if (GUILayout.Button(GUIContent("+",tooltip_text),GUILayout.Width(25)))
					            {
					            	current_terrain.add_treeprototype(count_tree+1);
			        				if (key.shift)
			        				{
			        					script.copy_terrain_tree(current_terrain.treePrototypes[count_tree],current_terrain.treePrototypes[count_tree+1]);
			        				}
			        				script.check_synchronous_terrain_trees(current_terrain);
					            } 	
					            if (script.settings.tooltip_mode != 0)
						        {
						    		tooltip_text = "Erase this Tree\n\n(Control Click)";
						    	}
					        	if (GUILayout.Button(GUIContent("-",tooltip_text),GUILayout.Width(25)) && key.control)
					        	{
					        		Undo.RegisterUndo(script,"Tree Erase");
	    							current_terrain.erase_treeprototype(count_tree);
	    							script.check_synchronous_terrain_trees(current_terrain);
					        		this.Repaint();
		        					return;
					        	}
		        				EditorGUILayout.EndHorizontal();
		        				
		        				EditorGUILayout.BeginHorizontal();
				        		GUILayout.Space(60);
				        		current_terrain.treePrototypes[count_tree].foldout = EditorGUILayout.Foldout(current_terrain.treePrototypes[count_tree].foldout,"Settings");
				        		EditorGUILayout.EndHorizontal();
				        		
		        				if (current_terrain.treePrototypes[count_tree].foldout)
		        				{
			        				EditorGUILayout.BeginHorizontal();
					        		GUILayout.Space(75);
					        		current_terrain.treePrototypes[count_tree].bendFactor = EditorGUILayout.FloatField("Bend Factor",current_terrain.treePrototypes[count_tree].bendFactor,GUILayout.Width(200));
					        		if (script.settings.tooltip_mode != 0)
							        {
							    		tooltip_text = "Set this bendfactor to all Trees in this Terrain\n(Click)\n\nSet this bendfactor to all Trees in the Terrains\n(Shift Click)";
							    	}
					        		if (GUILayout.Button(GUIContent(">Set All",tooltip_text),EditorStyles.miniButtonMid,GUILayout.Width(65)))
					        		{
					        			if (!key.shift)
					        			{
					        				Undo.RegisterUndo(script,"Set all Trees Settings");
					        				if (script.generate_auto){generate_auto();}
	    									script.set_all_trees_settings_terrain(current_terrain,count_tree);
	    								}
	    								else
	    								{
	    									Undo.RegisterUndo(script,"Set Trees all Terrains Settings");
	    									if (script.generate_auto){generate_auto();}
	    									script.set_all_trees_settings_terrains(current_terrain,count_tree);
	    								}
					        		}
			        				EditorGUILayout.EndHorizontal();
			        			}
			        			if (GUI.changed){script.check_synchronous_terrain_trees(current_terrain);this.Repaint();}
			        			GUI.changed = gui_changed_old;
							}
							
							if (current_terrain.terrain)
							{
			        			EditorGUILayout.BeginHorizontal();
					        	GUILayout.Space(60);
					        	if (script.settings.tooltip_mode != 0)
							    {
							    	tooltip_text = "Get Trees from "+current_terrain.name+" in Scene\n\n(Shift Click)";
							    }
					        	if (GUILayout.Button(GUIContent("<Get>",tooltip_text),GUILayout.Width(75)) && key.shift)
					        	{
					        		script.get_terrain_trees(current_terrain);
					        		script.check_synchronous_terrain_trees(current_terrain);
					        		this.Repaint();
					        	}
					        	if (!current_terrain.tree_synchronous)
					        	{
					        		GUI.color = Color.green;
					        	}
					        	if (script.settings.tooltip_mode != 0)
							    {
							    	tooltip_text = "Set Trees to "+current_terrain.name+" in Scene\n\n(Shift Click)";
							    }
					        	if (GUILayout.Button(GUIContent("<Set>",tooltip_text),GUILayout.Width(75)) && key.shift)
					        	{
					        		script.set_terrain_trees(current_terrain);
					        		script.check_synchronous_terrain_trees(current_terrain);
					        	}
					        	GUI.color = color_terrain;
					        	if (script.terrains.Count > 1)
			        			{
					        		if (script.settings.tooltip_mode != 0)
								    {
								    	tooltip_text = "Set all terrains Trees the same as "+current_terrain.name+"\n\n(Shift Click)";
								    }
					        		if (GUILayout.Button(GUIContent("<Set All>",tooltip_text),GUILayout.Width(75)) && key.shift)
					        		{
					        			script.set_all_terrain_trees(current_terrain);
					        			script.check_synchronous_terrain_trees(current_terrain);
					            	}
						        }
					        	EditorGUILayout.EndHorizontal();
					        }
			       		}
			       		
			       		EditorGUILayout.BeginHorizontal();
		        		GUILayout.Space(45);
		        		current_terrain.detail_foldout = EditorGUILayout.Foldout(current_terrain.detail_foldout,"Grass/Details");
		        		EditorGUILayout.EndHorizontal();
		        		
		        		if (current_terrain.detail_foldout)
		        		{
		        			EditorGUILayout.BeginHorizontal();
		        			GUILayout.Space(60);
		        			if (script.settings.tooltip_mode != 0)
					        {
					    		tooltip_text = "Add a new Grass/Detail";
					    	}
		        			if (GUILayout.Button(GUIContent("+",tooltip_text),GUILayout.Width(25)))
		        			{
		        				current_terrain.add_detailprototype(current_terrain.detailPrototypes.Count);
		        				if (key.shift)
		        				{
		        					script.copy_terrain_detail(current_terrain.detailPrototypes[current_terrain.detailPrototypes.Count-2],current_terrain.detailPrototypes[current_terrain.detailPrototypes.Count-1]);
		        				}
		        				script.check_synchronous_terrain_detail(current_terrain);
		        			}
		        			if (script.settings.tooltip_mode != 0)
					        {
					    		tooltip_text = "Erase the last Grass/Detail\n\n(Control Click)";
					    	}
		        			if (GUILayout.Button(GUIContent("-",tooltip_text),GUILayout.Width(25)))
		        			{
		        				if (!key.shift)
		        				{
		        					Undo.RegisterUndo(script,"Detail Erase");
	    							current_terrain.erase_detailprototype(current_terrain.detailPrototypes.Count-1);
	    						}
	    						else
	    						{
	    							Undo.RegisterUndo(script,"Detail Erase");
	    							current_terrain.clear_detailprototype();
	    						}
	    						script.check_synchronous_terrain_detail(current_terrain);
		        				this.Repaint();
		        				return;
		        			}
		        			if (script.settings.tooltip_mode != 0)
					        {
					    		tooltip_text = "Fold/Unfold all Grass/Details settings\n(Click)\n\nInvert Foldout all Grass/Details settings\n(Shift Click)";
					    	}
		        			if (GUILayout.Button(GUIContent("F",tooltip_text),GUILayout.Width(20)))
		        			{
		        				current_terrain.details_foldout = !current_terrain.details_foldout;
		        				script.change_details_settings_foldout(current_terrain,key.shift);
		        			}
		        			
		        			EditorGUILayout.EndHorizontal();
		        			for (count_detail = 0;count_detail < current_terrain.detailPrototypes.Count;++count_detail)
		        			{
		        				EditorGUILayout.BeginHorizontal();
				        		GUILayout.Space(60);
				        		current_terrain.detailPrototypes[count_detail].prototypeTexture = EditorGUILayout.ObjectField(current_terrain.detailPrototypes[count_detail].prototypeTexture,Texture2D,true,GUILayout.Width(55),GUILayout.Height(55));
				        		EditorGUILayout.LabelField(""+count_detail+".",GUILayout.Width(20));
				        		if (current_terrain.detailPrototypes[count_detail].prototypeTexture)
		        				{
		        					EditorGUILayout.LabelField(current_terrain.detailPrototypes[count_detail].prototypeTexture.name,GUILayout.Width(120));
		        				}
		        				if (script.settings.tooltip_mode != 0)
						        {
						    		tooltip_text = "Swap Grass/Detail with previous";
						    	}
		        				if (GUILayout.Button(GUIContent("<",tooltip_text),GUILayout.Width(25)) && count_detail > 0){script.swap_terrain_detail(current_terrain,count_detail,count_detail-1);script.check_synchronous_terrain_detail(current_terrain);}		 
					           	if (script.settings.tooltip_mode != 0)
						        {
						    		tooltip_text = "Swap Grass/Detail with next";
						    	}
					           	if (GUILayout.Button(GUIContent(">",tooltip_text),GUILayout.Width(25)) && count_detail < current_terrain.detailPrototypes.Count-1){script.swap_terrain_detail(current_terrain,count_detail,count_detail+1);script.check_synchronous_terrain_detail(current_terrain);}		 
					            if (script.settings.tooltip_mode != 0)
						        {
						    		tooltip_text = "Insert a new Grass/Detail";
						    	}
					            if (GUILayout.Button(GUIContent("+",tooltip_text),GUILayout.Width(25)))
					            {
					            	current_terrain.add_detailprototype(count_detail+1);
			        				if (key.shift)
			        				{
			        					script.copy_terrain_detail(current_terrain.detailPrototypes[count_detail],current_terrain.detailPrototypes[count_detail+1]);
			        				}
			        				script.check_synchronous_terrain_detail(current_terrain);
					            } 	
					            if (script.settings.tooltip_mode != 0)
						        {
						    		tooltip_text = "Erase this Grass/Detail\n\n(Control Click)";
						    	}
					        	if (GUILayout.Button(GUIContent("-",tooltip_text),GUILayout.Width(25)) && key.control)
					        	{
					        		Undo.RegisterUndo(script,"Detail Erase");
	    							current_terrain.erase_detailprototype(count_detail);
	    							script.check_synchronous_terrain_detail(current_terrain);
					        		this.Repaint();
		        					return;
					        	}
		        				EditorGUILayout.EndHorizontal();
		        				
		        				EditorGUILayout.BeginHorizontal();
				        		GUILayout.Space(60);
				        		current_terrain.detailPrototypes[count_detail].foldout = EditorGUILayout.Foldout(current_terrain.detailPrototypes[count_detail].foldout,"Settings");
				        		EditorGUILayout.EndHorizontal();
				        		
		        				if (current_terrain.detailPrototypes[count_detail].foldout)
		        				{
			        				EditorGUILayout.BeginHorizontal();
					        		GUILayout.Space(75);
					        		gui_changed_old = GUI.changed;
					        		GUI.changed = false;
			        				current_terrain.detailPrototypes[count_detail].minWidth = EditorGUILayout.FloatField("Min. Width",current_terrain.detailPrototypes[count_detail].minWidth,GUILayout.Width(200));
			        				EditorGUILayout.EndHorizontal();
			        				
			        				EditorGUILayout.BeginHorizontal();
					        		GUILayout.Space(75);
					        		current_terrain.detailPrototypes[count_detail].maxWidth = EditorGUILayout.FloatField("Max. Width",current_terrain.detailPrototypes[count_detail].maxWidth,GUILayout.Width(200));
			        				EditorGUILayout.EndHorizontal();
			        				
			        				EditorGUILayout.BeginHorizontal();
					        		GUILayout.Space(75);
					        		current_terrain.detailPrototypes[count_detail].minHeight = EditorGUILayout.FloatField("Min. Height",current_terrain.detailPrototypes[count_detail].minHeight,GUILayout.Width(200));
			        				EditorGUILayout.EndHorizontal();
			        				
			        				EditorGUILayout.BeginHorizontal();
					        		GUILayout.Space(75);
					        		current_terrain.detailPrototypes[count_detail].maxHeight = EditorGUILayout.FloatField("Max. Height",current_terrain.detailPrototypes[count_detail].maxHeight,GUILayout.Width(200));
			        				EditorGUILayout.EndHorizontal();
			        				
			        				EditorGUILayout.BeginHorizontal();
					        		GUILayout.Space(75);
					        		current_terrain.detailPrototypes[count_detail].noiseSpread = EditorGUILayout.FloatField("Noise Spread",current_terrain.detailPrototypes[count_detail].noiseSpread,GUILayout.Width(200));
			        				EditorGUILayout.EndHorizontal();
			        				
			        				EditorGUILayout.BeginHorizontal();
					        		GUILayout.Space(75);
					        		current_terrain.detailPrototypes[count_detail].bendFactor = EditorGUILayout.FloatField("Bend Factor",current_terrain.detailPrototypes[count_detail].bendFactor,GUILayout.Width(200));
			        				EditorGUILayout.EndHorizontal();
			        				
			        				EditorGUILayout.BeginHorizontal();
					        		GUILayout.Space(75);
					        		current_terrain.detailPrototypes[count_detail].healthyColor = EditorGUILayout.ColorField("Healthy Color",current_terrain.detailPrototypes[count_detail].healthyColor,GUILayout.Width(300));
			        				EditorGUILayout.EndHorizontal();
			        				
			        				EditorGUILayout.BeginHorizontal();
					        		GUILayout.Space(75);
					        		current_terrain.detailPrototypes[count_detail].dryColor = EditorGUILayout.ColorField("Dry Color",current_terrain.detailPrototypes[count_detail].dryColor,GUILayout.Width(300));
			        				EditorGUILayout.EndHorizontal();
			        				
			        				EditorGUILayout.BeginHorizontal();
					        		GUILayout.Space(75);
					        		current_terrain.detailPrototypes[count_detail].renderMode = EditorGUILayout.EnumPopup("Render Mode",current_terrain.detailPrototypes[count_detail].renderMode,GUILayout.Width(300));
			        				EditorGUILayout.EndHorizontal();
			        			}
		        				
							}
							if (GUI.changed){script.check_synchronous_terrain_detail(current_terrain);}
		        			
							if (current_terrain.detailPrototypes.Count > 0)
							{
								EditorGUILayout.BeginHorizontal(); 
				           		GUILayout.Space(60);
			        			EditorGUILayout.LabelField("Scale",GUILayout.Width(147));
			        			GUI.changed = false;
			        			current_terrain.detail_scale = EditorGUILayout.Slider(current_terrain.detail_scale,0,10,GUILayout.Width(200));
				            	EditorGUILayout.EndHorizontal();
				            	if (GUI.changed)
				            	{
				            		script.change_terrain_detail_scale(current_terrain);
				            		script.check_synchronous_terrain_detail(current_terrain);
				            	}
			        			GUI.changed = gui_changed_old;
							}
							
							if (current_terrain.terrain)
							{
			        			EditorGUILayout.BeginHorizontal();
					        	GUILayout.Space(60);
					        	if (script.settings.tooltip_mode != 0)
							    {
							    	tooltip_text = "Get Grass/Detail from "+current_terrain.name+" in Scene\n\n(Shift Click)";
							    }
					        	if (GUILayout.Button(GUIContent("<Get>",tooltip_text),GUILayout.Width(75)) && key.shift)
					        	{
					        		script.get_terrain_details(current_terrain);
					        		script.check_synchronous_terrain_detail(current_terrain);
					        	}
					        	if (!current_terrain.detail_synchronous)
					        	{
					        		GUI.color = Color.green;
					        	}
					        	if (script.settings.tooltip_mode != 0)
							    {
							    	tooltip_text = "Set Grass/Detail to "+current_terrain.name+" in Scene\n\n(Shift Click)";
							    }
					        	if (GUILayout.Button(GUIContent("<Set>",tooltip_text),GUILayout.Width(75)) && key.shift)
					        	{
					        		script.set_terrain_details(current_terrain);
					        		script.check_synchronous_terrain_detail(current_terrain);
					        	}
					        	GUI.color = color_terrain;
					        	if (script.terrains.Count > 1)
			        			{
					        		if (script.settings.tooltip_mode != 0)
								    {
								    	tooltip_text = "Set all terrains Grass/Detail the same as "+current_terrain.name+"\n\n(Shift Click)";
								    }
					        		if (GUILayout.Button(GUIContent("<Set All>",tooltip_text),GUILayout.Width(75)) && key.shift)
					        		{
					        			script.set_all_terrain_details(current_terrain);
					        			script.check_synchronous_terrain_detail(current_terrain);
						        	}
						        }
					        	EditorGUILayout.EndHorizontal();
					        }
			       		}
			       		
			       		EditorGUILayout.BeginHorizontal();
		        		GUILayout.Space(45);
		        		current_terrain.reset_foldout = EditorGUILayout.Foldout(current_terrain.reset_foldout,"Reset");
		        		EditorGUILayout.EndHorizontal();
		        		
		        		if (current_terrain.reset_foldout && current_terrain.terrain)
		        		{
			       			EditorGUILayout.BeginHorizontal();
			        		GUILayout.Space(60);
			        		if (script.settings.tooltip_mode != 0)
						    {
						    	tooltip_text = "Reset Heightmap Data of "+current_terrain.name+" in Scene\n(Control Click)\n\nReset Heightmap Data of all Terrains\n(Control Shift Click)";
						    }
				        	if (GUILayout.Button(GUIContent("-Reset Heightmap-",tooltip_text),GUILayout.Width(125)) && key.control)
			        		{
			        			if (!key.alt)
			        			{
			        				var heights: float [,] = new float[current_terrain.terrain.terrainData.heightmapResolution,current_terrain.terrain.terrainData.heightmapResolution];
				        			if (key.shift)
				        			{
				        				script.terrain_reset_heightmap(current_terrain,true);
				        			}
				        			else
				        			{
				        				script.terrain_reset_heightmap(current_terrain,false);
				        			}
				        		}
				        		else
				        		{
				        			if (!key.shift)
				        			{
				        				script.assign_heightmap(current_terrain);
				        			}
				        			else
				        			{
				        				script.assign_heightmap_all_terrain();	
				        			}
				        		}
			        		}
			        		if (script.settings.tooltip_mode != 0)
						    {
						    	tooltip_text = "Reset Splatmap Data of "+current_terrain.name+" in Scene\n(Control Click)\n\nReset Splatmap Data of all Terrains\n(Control Shift Click)";
						    }
			        		if (GUILayout.Button(GUIContent("-Reset Splatmap-",tooltip_text),GUILayout.Width(125)) && key.control)
			        		{
			        			if (key.shift)
			        			{
			        				script.terrain_all_reset_splat();
			        			}
			        			else
			        			{
			        				script.terrain_reset_splat(current_terrain);	
			        			}
			        		}
			        		if (script.settings.tooltip_mode != 0)
						    {
						    	tooltip_text = "Reset placed Trees in "+current_terrain.name+" in Scene\n(Control Click)\n\nReset placed Trees in all Terrains\n(Control Shift Click)";
						    }
			        		if (GUILayout.Button(GUIContent("-Reset Trees-",tooltip_text),GUILayout.Width(105)) && key.control)
			        		{
			        			if (key.shift)
			        			{
			        				script.terrain_reset_trees(current_terrain,true);
			        			}
			        			else
			        			{
			        				script.terrain_reset_trees(current_terrain,false);
			        			}
			        		}
			        		if (script.settings.tooltip_mode != 0)
						    {
						    	tooltip_text = "Reset Detail/Grass Data of "+current_terrain.name+" in Scene\n(Control Click)\n\nReset Detail/Grass Data of all Terrains\n(Control Shift Click)";
						    }
			        		if (GUILayout.Button(GUIContent("-Reset Detail-",tooltip_text),GUILayout.Width(105)) && key.control)
			        		{
			        			if (current_terrain.terrain.terrainData.detailPrototypes.Length > 0)
			        			{
			        				if (key.shift)
				        			{
				        				script.terrain_reset_grass(current_terrain,true);
				        			}
				        			else
				        			{
				        				script.terrain_reset_grass(current_terrain,false);
				        			}
				        		}
			        		}
			        		if (script.settings.tooltip_mode != 0)
						    {
						    	tooltip_text = "Erase placed Objects in Scene\n(Control Click)";
						    }
			        		if (GUILayout.Button(GUIContent("-Reset Objects-",tooltip_text),GUILayout.Width(115)) && key.control)
			        		{
			        			script.loop_prelayer("(cpo)",0,true);
				        	}
			        		EditorGUILayout.EndHorizontal();
			        	}
			        	
			       		EditorGUILayout.BeginHorizontal();
		        		GUILayout.Space(45);
		        		current_terrain.scripts_foldout = EditorGUILayout.Foldout(current_terrain.scripts_foldout,"Scripts");
		        		EditorGUILayout.EndHorizontal();
		        		
		        		if (current_terrain.scripts_foldout && current_terrain.terrain)
		        		{
		        			if (script.terrains.Count > 1)
		        			{
		        				EditorGUILayout.BeginHorizontal();
		        				GUILayout.Space(60);
		        				
		        				if (current_terrain.terrain.GetComponent(TerrainNeighbors))
		        				{
		        					if (script.settings.tooltip_mode != 0)
								    {
								    	tooltip_text = "Remove Neighbors script for all terrains in Scene";
								    }
		        					if (GUILayout.Button(GUIContent("Remove Neighbors",tooltip_text),GUILayout.Width(140)))
			        				{
			        					script.set_neighbor(-1);
			        				}
		        					EditorGUILayout.LabelField("ON");
		        				}
		        				else
		        				{
		        					if (script.settings.tooltip_mode != 0)
								    {
								    	tooltip_text = "Add Neighbors script to all terrains in Scene\n\nThis will create seamless borders between Terrains in Runtime";
								    }
		        					if (GUILayout.Button(GUIContent("Add NeighBors",tooltip_text),GUILayout.Width(140)))
			        				{
			        					script.set_neighbor(1);
			        				}
		        					EditorGUILayout.LabelField("OFF");
		        				}
		        				EditorGUILayout.EndHorizontal();
		        			}
		        		}
		        	}
		        	EditorGUILayout.BeginHorizontal();
					GUILayout.Space(30);
					if (current_terrain.terrain){EditorGUILayout.LabelField("Trees placed: "+current_terrain.terrain.terrainData.treeInstances.Length,GUILayout.Width(250));}
					EditorGUILayout.EndHorizontal();
					
					if (!current_terrain.terrain)
					{
						GUILayout.Space(5);
						
						EditorGUILayout.BeginHorizontal();
						GUILayout.Space(30);
						EditorGUILayout.LabelField("Path",GUILayout.Width(160));
			        	EditorGUILayout.LabelField(""+script.terrain_path);
			        	if (GUILayout.Button("Change",GUILayout.Width(65)))
			        	{
			        		var terrain_path: String = EditorUtility.OpenFolderPanel("Export File Path",script.terrain_path,"");
			        		if (terrain_path != ""){script.terrain_path = terrain_path;}
			        	}
			        	EditorGUILayout.EndHorizontal();
			        	
			        	EditorGUILayout.BeginHorizontal();
			        	GUILayout.Space(30);
			        	EditorGUILayout.LabelField("Terrain Asset Name",GUILayout.Width(160));
			        	script.terrain_asset_name = EditorGUILayout.TextField(script.terrain_asset_name);
			        	EditorGUILayout.EndHorizontal();
			        	
			        	EditorGUILayout.BeginHorizontal();
			        	GUILayout.Space(30);
			        	EditorGUILayout.LabelField("Terrain Scene Name",GUILayout.Width(160));
			        	script.terrain_scene_name = EditorGUILayout.TextField(script.terrain_scene_name);
			        	EditorGUILayout.EndHorizontal();
			        	
			        	EditorGUILayout.BeginHorizontal();
			        	GUILayout.Space(30);
			        	EditorGUILayout.LabelField("Scene Parent",GUILayout.Width(160));
			        	script.terrain_parent = EditorGUILayout.ObjectField(script.terrain_parent,Transform,true);
			        	EditorGUILayout.EndHorizontal();
			        	
			        	if (script.terrains.Count > 1)
						{
							EditorGUILayout.BeginHorizontal();
							GUILayout.Space(30);
							EditorGUILayout.LabelField("Copy Settings Terrain",GUILayout.Width(160));
							// EditorGUILayout.LabelField("Terrain",GUILayout.Width(70));
							gui_changed_old = GUI.changed;
							GUI.changed = false;
							current_terrain.copy_terrain = EditorGUILayout.IntField(current_terrain.copy_terrain,GUILayout.Width(50));
							if (GUI.changed)
							{
								if (current_terrain.copy_terrain == count_terrain){--current_terrain.copy_terrain;}
								if (current_terrain.copy_terrain < 0){current_terrain.copy_terrain = 0;}
								if (current_terrain.copy_terrain > script.terrains.Count-1){current_terrain.copy_terrain = script.terrains.Count-1;}
							}
							GUI.changed = gui_changed_old;
							current_terrain.copy_terrain_settings = EditorGUILayout.Toggle(current_terrain.copy_terrain_settings,GUILayout.Width(25));
							EditorGUILayout.EndHorizontal();
						}
			        	
			        	EditorGUILayout.BeginHorizontal();
						GUILayout.Space(30);
						EditorGUILayout.LabelField("Terrain Instances",GUILayout.Width(160));
						gui_changed_old = GUI.changed;
						GUI.changed = false;
						script.terrain_instances = EditorGUILayout.IntField(script.terrain_instances,GUILayout.Width(50));
						if (GUI.changed)
						{
							if (script.terrain_instances < -script.terrains.Count){script.terrain_instances = -script.terrains.Count;}
						}
						GUI.changed = false;
						EditorGUILayout.LabelField("Tiles "+script.terrain_tiles+"x"+script.terrain_tiles,GUILayout.Width(75));
						script.terrain_tiles = EditorGUILayout.IntSlider(script.terrain_tiles,1,script.settings.terrain_tiles_max);
						if (GUI.changed)
						{
							script.calc_terrain_needed_tiles();
						}
						GUI.changed = gui_changed_old;
						EditorGUILayout.EndHorizontal();
						
						EditorGUILayout.BeginHorizontal();
						GUILayout.Space(30);
						var button_text: String;
						if (script.terrain_instances > 1){button_text = "Create Terrains";} else {button_text = "Create Terrain";}
						if (script.terrain_instances > 0)
						{
							if (GUILayout.Button(button_text,GUILayout.Width(150)))
							{
								create_terrain(current_terrain,script.terrain_instances,1+count_terrain);
							}
						}
						if (script.terrain_instances < 0)
						{
							GUI.backgroundColor = Color.red;
							if (GUILayout.Button("-Erase Terrains-",GUILayout.Width(150)) && key.control)
							{
								erase_terrains(script.terrain_instances*-1,script.terrain_asset_erase);
							}
							GUILayout.Space(7);
							EditorGUILayout.LabelField("-> Erase TerrainData Assets from Project",GUILayout.Width(250));
							if (!script.terrain_asset_erase){GUI.backgroundColor = Color.white;}
							script.terrain_asset_erase = EditorGUILayout.Toggle(script.terrain_asset_erase,GUILayout.Width(25));
							GUI.backgroundColor = Color.white;
						}
						EditorGUILayout.EndHorizontal();
					}
				}
	}
	
	function draw_prelayer(prelayer: prelayer_class,space: int,text: String,layer_minimum: int)
	{
        gui_changed_old2 = GUI.changed;
        GUI.changed = false;
        current_prelayer_number = prelayer.index;
	    
	    // prelayer
        if (script.settings.color_scheme){GUI.color = script.settings.color.color_layer;}
        EditorGUILayout.BeginHorizontal();
        GUILayout.Space(space);
        if (prelayer.index > 0){text += "Object";}
        if (script.show_prelayer > 0)
        {
        	for (var count_level: int = 0;count_level < prelayer.level;++count_level){text = text.Insert(0,"<");}
        }
        var prelayer_text: String;
        
        gui_changed_old = GUI.changed;
        prelayer.foldout = EditorGUILayout.Foldout (prelayer.foldout,text+prelayer.layer_text+prelayer_text);
        GUI.changed = gui_changed_old;
        EditorGUILayout.EndHorizontal();
        
       	if (key.type == EventType.layout){mouse_position = key.mousePosition;}
	    
        if (prelayer.foldout)
	    {
	        EditorGUILayout.BeginHorizontal();
	        GUILayout.Space(space+15);
	        if (script.settings.tooltip_mode != 0)
			{
				tooltip_text = "Add a new Layer\n(Click)\n\nDuplicate this Layer\n(Shift Click)";
			}
	      	if (GUILayout.Button(GUIContent("+",tooltip_text),GUILayout.Width(25)))
	      	{
	      		var layer_position: int = script.get_layer_position(prelayer.predescription.description[prelayer.predescription.description_position].layer_index.Count-1,prelayer.predescription.description_position,prelayer);
	      		add_layer(prelayer,layer_position,prelayer.predescription.description_position,prelayer.predescription.description[prelayer.predescription.description_position].layer_index.Count);
	      	}
	      	if (script.settings.tooltip_mode != 0)
			{
				tooltip_text = "Erase the last Layer\n\n(Control Click)";
			}
        	if (GUILayout.Button(GUIContent("-",tooltip_text),GUILayout.Width(25)) && prelayer.layer.Count > 0 && key.control)
        	{
        		if (script.description_display)
        		{
        			if (prelayer.predescription.description[prelayer.predescription.description_position].layer_index.Count > 0)
        			{
        				erase_layer(prelayer,prelayer.layer.Count-1,prelayer.predescription.description_position,prelayer.predescription.description[prelayer.predescription.description_position].layer_index.Count-1);
        				this.Repaint();
        				return;
        			}
        		}
        	}
        	gui_changed_old = GUI.changed;
        	GUI.changed = false;
        	prelayer.layer_output = EditorGUILayout.EnumPopup("",prelayer.layer_output,GUILayout.Width(80));
        
        	if (GUI.changed)
        	{
        		if (prelayer.view_only_selected){script.set_view_only_selected(prelayer,prelayer.layer_output);}
        	}
        	GUI.changed = gui_changed_old;
        	if (script.settings.color_scheme){GUI.color = script.settings.color.color_description;}
        	prelayer.predescription.description_position = EditorGUILayout.Popup(prelayer.predescription.description_position,prelayer.predescription.description_enum,GUILayout.Width((prelayer.predescription.description_enum[prelayer.predescription.description_position].Length*10.0)+10));
        	if (script.settings.tooltip_mode != 0)
			{
				tooltip_text = "Display Layer Menu (Click)\n\nTo view another ObjectLayer Level -> Enter the ObjectLayer Level number in the number field or (Shift Click) on this button at the ObjectLayer\n\n(Shift Click again to return to Layer Level 0)";
			}
			if (script.settings.color_scheme){GUI.color = script.settings.color.color_layer;}
        	
			var button_view: boolean = GUILayout.Button(GUIContent("»View",tooltip_text),GUILayout.Width(50));
	        	
	        if (key.type == EventType.Repaint) 
			{
        		prelayer.view_menu_rect = GUILayoutUtility.GetLastRect();
        	}
        
            if (button_view)
        	{
        		if (key.shift)
        		{
        			if (prelayer.index == script.show_prelayer){script.show_prelayer = 0;}
        			else {script.show_prelayer = prelayer.index;}
        		}
        		else
        		{
	        		var userdata1: menu_arguments_class[] = new menu_arguments_class[8];
	        	 	var menu: GenericMenu;
	        	 		
	        		userdata1[0] = new menu_arguments_class();
	        		userdata1[0].name = "view_heightmap_layer";
	        		userdata1[0].prelayer = prelayer;
	        		userdata1[1] = new menu_arguments_class();
	        		userdata1[1].name = "view_color_layer";
	        		userdata1[1].prelayer = prelayer;
	        		userdata1[2] = new menu_arguments_class();
	        		userdata1[2].name = "view_splat_layer";
	        		userdata1[2].prelayer = prelayer;
	        		userdata1[3] = new menu_arguments_class();
	        		userdata1[3].name = "view_tree_layer";
	        		userdata1[3].prelayer = prelayer;
	        		userdata1[4] = new menu_arguments_class();
	        		userdata1[4].name = "view_grass_layer";
	        		userdata1[4].prelayer = prelayer;
	        		userdata1[5] = new menu_arguments_class();
	        		userdata1[5].name = "view_object_layer";
	        		userdata1[5].prelayer = prelayer;
	        		userdata1[6] = new menu_arguments_class();
	        		userdata1[6].name = "view_only_selected";
	        		userdata1[6].prelayer = prelayer;
	        		userdata1[7] = new menu_arguments_class();
	        		userdata1[7].name = "view_all";
	        		userdata1[7].prelayer = prelayer;
	        			
	        	 	menu = new GenericMenu (); 
	        	
	        		menu.AddItem (new GUIContent("Heigtmap"),prelayer.view_heightmap_layer, view_menu, userdata1[0]);                
	        	 	menu.AddItem (new GUIContent("Color"),prelayer.view_color_layer, view_menu, userdata1[1]);                
	        	 	menu.AddItem (new GUIContent("Splat"),prelayer.view_splat_layer, view_menu, userdata1[2]);                
	        	 	menu.AddItem (new GUIContent("Tree"),prelayer.view_tree_layer, view_menu, userdata1[3]);                
	        	 	menu.AddItem (new GUIContent("Grass"),prelayer.view_grass_layer, view_menu, userdata1[4]);                
	        	 	menu.AddItem (new GUIContent("Object"),prelayer.view_object_layer, view_menu, userdata1[5]);                
	        	 	menu.AddSeparator (""); 
	        	 	menu.AddItem (new GUIContent("Only Selected"),prelayer.view_only_selected, view_menu, userdata1[6]);                              
	        	 	menu.AddItem (new GUIContent("All"),false, view_menu, userdata1[7]);
	        	 	
	        	 	menu.DropDown (prelayer.view_menu_rect);
	        	 }
        	}
        	
        	if (script.show_prelayer < 0){script.show_prelayer = 0;}
			if (script.show_prelayer > script.prelayers.Count-1){script.show_prelayer = script.prelayers.Count-1;}        	
        	
        	if (prelayer.index == script.show_prelayer)
        	{
        		script.show_prelayer = EditorGUILayout.IntField(script.show_prelayer,GUILayout.Width(45));        	
			}
        	if (script.settings.tooltip_mode != 0)
			{
				tooltip_text = "Sort all Layers in the next order:\n\n1. Heightmap\n2. Colormap\n3. Splatmap\n4. Tree\n5. Grass/Detail\n6. Object\n\n(Shift Click)";
			}
        	if (GUILayout.Button(GUIContent("<Sort>",tooltip_text),GUILayout.Width(55)) && key.shift)
        	{
        		Undo.RegisterUndo(script,"Sort Layers");
        		script.layers_sort(prelayer);
        	}
        	if (script.settings.tooltip_mode != 0)
			{
				tooltip_text = "Fold/Unfold all Layers\n(Click)\n\nInvert Foldout all layers\n(Shift Click)\n\nClose every Foldout\n(Alt Click)";
			}
        	if (GUILayout.Button(GUIContent("F",tooltip_text),GUILayout.Width(20)))
        	{
        		if (!key.alt){prelayer.layers_foldout = !prelayer.layers_foldout;prelayer.change_foldout_layers(key.shift);}
        		else
        		{
        			script.loop_prelayer("(caf)",0,true);
        		}
        	}
        	if (script.settings.tooltip_mode != 0)
			{
				tooltip_text = "Activate/Deactivate all Layers\n(Click)\n\nInvert Activation all layers\n(Shift Click)";
			}
        	if (GUILayout.Button(GUIContent("A",tooltip_text),GUILayout.Width(20))){prelayer.layers_active = !prelayer.layers_active;prelayer.change_layers_active(key.shift);}
        	if (script.settings.tooltip_mode != 0)
			{
				tooltip_text = "Display/Hide Layer Interface Buttons\n(Click)\n\nDisplay/Hide LayerGroup Interface Buttons\n(Shift Click)";
			}
        	if (GUILayout.Button(GUIContent("»I",tooltip_text),GUILayout.Width(25)))
        	{
        		if (!key.shift)
        		{
        			prelayer.interface_display_layer = !prelayer.interface_display_layer;
        		}
        		else
        		{
        			prelayer.interface_display_layergroup = !prelayer.interface_display_layergroup;
        		}
        	}
        	EditorGUILayout.EndHorizontal();
        	
        	if (script.settings.remarks)
        	{
        		GUI.color = Color.white;
        		draw_remarks(prelayer.remarks,space+15);
        		if (script.settings.color_scheme){GUI.color = script.settings.color.color_layer;}
        	}
        	
        	if (!prelayer.prearea.active){GUI.color += Color(-0.3,-0.3,-0.3,0);}
        	draw_area(prelayer.index,prelayer.prearea,script.terrains[0],space-15,true);
        	if (!prelayer.prearea.active){GUI.color += Color(0.3,0.3,0.3,0);}
        	
        	GUILayout.Space(2);
        	for (count_description = 0;count_description < prelayer.predescription.description.Count;++count_description)
	        {
	        	if (script.description_display)
        		{
	        		EditorGUILayout.BeginHorizontal();
	        		GUILayout.Space(space+15);
	        		if (script.settings.color_scheme){GUI.color = script.settings.color.color_description;}
	        		var text1: String = prelayer.predescription.description[count_description].text+" ("+prelayer.predescription.description[count_description].layer_index.Count+")";
	        		gui_changed_old = GUI.changed;
	        		prelayer.predescription.description[count_description].foldout = EditorGUILayout.Foldout(prelayer.predescription.description[count_description].foldout,text1);
	        		GUI.changed = gui_changed_old;
	        		
	        		if (key.type == EventType.Repaint)
	        		{
	        			prelayer.predescription.description[count_description].rect = GUILayoutUtility.GetLastRect();
	        			prelayer.predescription.description[count_description].rect.width = (text1.Length*7)-15;
	        			prelayer.predescription.description[count_description].rect.x += 15;
	        		}
	        	
	        		if (check_point_in_rect(prelayer.predescription.description[count_description].rect,mouse_position - Vector2(-5,script.settings.top_height)) && key.button == 0 && key.clickCount == 2 && key.type == EventType.layout)
					{
						prelayer.predescription.description[count_description].edit = !prelayer.predescription.description[count_description].edit;
						this.Repaint();
					}
					if (prelayer.interface_display_layergroup)
					{
						GUILayout.Space(50);
						if (script.settings.tooltip_mode != 0)
						{
							tooltip_text = "Edit LayerGroup name\n\n(You can change LayerGroup names for better overview)";
						}
						if (GUILayout.Button(GUIContent("E",tooltip_text),GUILayout.Width(25))){prelayer.predescription.description[count_description].edit = !prelayer.predescription.description[count_description].edit;}
						if (script.settings.tooltip_mode != 0)
						{
							tooltip_text = "LayerGroup Popup Menu for New/Load/Save and Sorting Layers";
						}
						var button_description: boolean = GUILayout.Button(GUIContent("Menu",tooltip_text),GUILayout.Width(55));
			        	if (key.type == EventType.Repaint) 
						{
		        	 		prelayer.predescription.description[count_description].menu_rect = GUILayoutUtility.GetLastRect();
		        	 	}
		        	 	
		        	 	if (button_description)
		        		{
		        	 		var description_menu1: GenericMenu;
		        	 		var description_menu_data: menu_arguments_class[] = new menu_arguments_class[3];
		        	 		      	 		
		        	 		description_menu1 = new GenericMenu ();    
		        	 		current_description_number = count_description;                            
		        	 		description_menu1.AddItem (new GUIContent("New"),false,description_menu,"new");                
		        	 		description_menu1.AddSeparator (""); 
		        	 		description_menu1.AddItem (new GUIContent("Open"),false,description_menu,"open");                
		        	        description_menu1.AddItem (new GUIContent("Save"),false,description_menu,"save");    
		        	        description_menu1.AddSeparator (""); 
		        	        description_menu1.AddItem (new GUIContent("Sort Layers"),false,description_menu,"sort");
		        	 		
		        	 		description_menu1.DropDown (prelayer.predescription.description[count_description].menu_rect);
		        		}
	        		
						if (script.settings.tooltip_mode != 0)
						{
							tooltip_text = "Fold/Unfold Layers from this LayerGroup\n(Click)\n\nInvert Foldout Layers from this LayerGroup(Shift Click)";
						}
						if (GUILayout.Button(GUIContent("F",tooltip_text),GUILayout.Width(20)))	
		        		{
		        			prelayer.predescription.description[count_description].layers_foldout = !prelayer.predescription.description[count_description].layers_foldout;
							prelayer.change_layers_foldout_from_description(count_description,key.shift);
		        		}
						if (script.settings.toggle_text_no){GUILayout.Space(0);} 
						else 
						{
							if (script.settings.toggle_text_long){GUILayout.Space(34);} else {GUILayout.Space(12);}
						}
					}
					if (script.settings.tooltip_mode != 0)
					{
						tooltip_text = "Activate/Deactive Layers from this LayerGroup\n(Click)\n\nInvert Activation Layers from this LayerGroup\n(Shift Click)";
					}
		        	if (GUILayout.Button(GUIContent("A",tooltip_text),GUILayout.Width(20)))	
		        	{
		        		prelayer.predescription.description[count_description].layers_active = !prelayer.predescription.description[count_description].layers_active;
						prelayer.change_layers_active_from_description(count_description,key.shift);
		        	}
		        	GUILayout.Space(8);
		        		
		        	if (prelayer.interface_display_layergroup)
					{
		        		if (script.settings.tooltip_mode != 0)
						{
							tooltip_text = "Swap LayerGroup with previous";
						}
		        		if (GUILayout.Button(GUIContent("<",tooltip_text),GUILayout.Width(25)) && count_description > 0){script.swap_description(count_description,count_description-1,prelayer);}	
		        		if (script.settings.tooltip_mode != 0)
						{
							tooltip_text = "Swap Selector -> Click to swap with another LayerGroup\n\n(Alt Click)To copy this LayerGroup\n(Alt Click -> '+' on LayerGroup)To paste";
						}	 
			           	if (GUILayout.Button(GUIContent(prelayer.predescription.description[count_description].swap_text,tooltip_text),GUILayout.Width(35)))
			           	{
			           		swap_description(prelayer,prelayer.predescription.description[count_description],count_description);
					   	}
					   	if (script.settings.tooltip_mode != 0)
						{
							tooltip_text = "Swap LayerGroup with next";
						} 		 
			           	if (GUILayout.Button(GUIContent(">",tooltip_text),GUILayout.Width(25)) && count_description < prelayer.predescription.description.Count-1){script.swap_description(count_description,count_description+1,prelayer);}		 
			            if (script.settings.tooltip_mode != 0)
						{
							tooltip_text = "Add a new LayerGroup\n(Click)\n\nDuplicate this LayerGroup\n(Shift Click)";
						}
			            if (GUILayout.Button(GUIContent("+",tooltip_text),GUILayout.Width(25)))
			            {
			            	add_description(prelayer,count_description);
			            }
			            if (script.settings.tooltip_mode != 0)
						{
							tooltip_text = "Erase this LayerGroup\n\n(Control Click)";
						} 	
			        	if (GUILayout.Button(GUIContent("-",tooltip_text),GUILayout.Width(25)) && key.control && prelayer.predescription.description.Count > 1)
			        	{
			        		erase_description(prelayer,count_description);
			        		this.Repaint();
			        		return;
			        	}
			        }
			        
			        if (prelayer.predescription.description[count_description].disable_edit && key.type == EventType.Layout)
			        {
			        	prelayer.predescription.description[count_description].edit = false;
			        	prelayer.predescription.description[count_description].disable_edit = false;
			        }
	        		EditorGUILayout.EndHorizontal();
	        		
	        		GUILayout.Space(2);
	        		
	        		if (prelayer.predescription.description[count_description].edit)
	        		{
	        			EditorGUILayout.BeginHorizontal();
	        			GUILayout.Space(space+30);
	        			
	        			gui_changed_old = GUI.changed;
	        			GUI.changed = false;
	        			GUI.SetNextControlName ("des"+count_description);
	        			prelayer.predescription.description[count_description].text = EditorGUILayout.TextField(prelayer.predescription.description[count_description].text);
	        			if (key.keyCode == KeyCode.Return && GUI.GetNameOfFocusedControl() == "des"+count_description)
	        			{
	        				prelayer.predescription.description[count_description].disable_edit = true;
	        			}
	        			if (GUI.changed)
	        			{
	        				prelayer.predescription.set_description_enum();
	        			}
	        			EditorGUILayout.EndHorizontal();
		    	
	        			GUI.changed = gui_changed_old;
	        		}
	        		
	        		if (new_description)
				    {
				       	if (count_description == new_description_number)
				       	{
					       	EditorGUILayout.BeginHorizontal();
					       	GUILayout.Space(space+30);
					       	EditorGUILayout.LabelField("All layer content of this Group will be lost. Are you sure?",GUILayout.Width(340));
					       	if (GUILayout.Button("Yes",GUILayout.Width(40)))
					       	{
					       		Undo.RegisterUndo(script,"New LayerGroup");
					       		script.new_layergroup(prelayer,count_description);
					       		new_description = false;
					       	}
					       	if (GUILayout.Button("No",GUILayout.Width(40)))
					       	{
					       		new_description = false;
					       	}	
					       	EditorGUILayout.EndHorizontal();
					    }
				    }
				}
		        
	        	if (prelayer.predescription.description[count_description].foldout || !script.description_display)
	        	{
	        		if (script.settings.color_scheme){GUI.color = Color.white;}
	        		if (script.settings.remarks)
	        		{
	        			draw_remarks(prelayer.predescription.description[count_description].remarks,33);
	        		}
	        		for (var count_layer: int = 0;count_layer < prelayer.predescription.description[count_description].layer_index.Count;++count_layer)
	        		{
	        			draw_layer(prelayer,prelayer.predescription.description[count_description].layer_index[count_layer],count_layer,count_description,space+15,String.Empty,layer_minimum);
	        		}
	        		if (script.description_display){GUILayout.Space(5);}
	        	}
			}   	                 	                
	    } 
	    if (script.settings.color_scheme){GUI.color = Color.white;}
	    if (script.generate_auto)
		{
			if (GUI.changed){generate_auto();}
			GUI.changed = gui_changed_old2;
		}
	}
	
	function draw_remarks(remarks: remarks_class,space: float)
	{
		EditorGUILayout.BeginHorizontal();
		GUILayout.Space(space);
		gui_changed_old = GUI.changed;
		remarks.textfield_foldout = EditorGUILayout.Foldout(remarks.textfield_foldout,"Remarks");
		GUI.changed = gui_changed_old;
		EditorGUILayout.EndHorizontal();
			           	
		if (remarks.textfield_foldout)
		{
			EditorGUILayout.BeginHorizontal();
			GUILayout.Space(space+15);
			
			gui_changed_old = GUI.changed;
			GUI.changed = false;
			remarks.textfield = EditorGUILayout.TextArea(remarks.textfield,GUILayout.Height(5+(remarks.textfield_length*13.1)));
			if (GUI.changed)
			{
				remarks.textfield_length = remarks.textfield.Split("\n"[0]).Length;
			}
			GUI.changed = gui_changed_old;
			
			EditorGUILayout.EndHorizontal();
		}
	}

	function draw_layer(prelayer: prelayer_class,layer_number: int,count_layer: int,count_description: int,space: int,text: String,layer_minimum: int)
	{
		current_layer = prelayer.layer[layer_number];
		
	    if((current_layer.output == layer_output_enum.color && prelayer.view_color_layer) 
	    	|| (current_layer.output == layer_output_enum.splat && prelayer.view_splat_layer)
	    		|| (current_layer.output == layer_output_enum.tree && prelayer.view_tree_layer)
	    			|| (current_layer.output == layer_output_enum.grass && prelayer.view_grass_layer)
	    				|| (current_layer.output == layer_output_enum.object && prelayer.view_object_layer)
	       					 || (current_layer.output == layer_output_enum.heightmap && prelayer.view_heightmap_layer))
	    {
	    	color_layer = script.settings.color.color_layer;
	        
	        if (!current_layer.active){color_layer += Color(-0.3,-0.3,-0.3,0);} 
	        	
	        if (current_layer.color_layer != color_layer)
		    {
		    	if (current_layer.color_layer[0] > color_layer[0]){current_layer.color_layer[0] -= 0.004;} 
		        	else if (current_layer.color_layer[0]+0.01 < color_layer[0]){current_layer.color_layer[0] += 0.004;}	
		        		else {current_layer.color_layer[0] = color_layer[0];}
		        if (current_layer.color_layer[1] > color_layer[1]){current_layer.color_layer[1] -= 0.004;} 
		        	else if (current_layer.color_layer[1]+0.01 < color_layer[1]){current_layer.color_layer[1] += 0.004;}
		           		else {current_layer.color_layer[1] = color_layer[1];}
				if (current_layer.color_layer[2] > color_layer[2]){current_layer.color_layer[2] -= 0.004;} 
					else if (current_layer.color_layer[2]+0.01 < color_layer[2]){current_layer.color_layer[2] += 0.004;}
						else {current_layer.color_layer[2] = color_layer[2];}
				if (current_layer.color_layer[3] > color_layer[3]){current_layer.color_layer[3] -= 0.004;} 
					else if (current_layer.color_layer[3]+0.01 < color_layer[3]){current_layer.color_layer[3] += 0.004;}
						else {current_layer.color_layer[3] = color_layer[3];}
		        this.Repaint();
			}
			
		    if (script.settings.color_scheme){GUI.color = current_layer.color_layer;} else {GUI.color = Color.white;}
	        
	        if (script.settings.box_scheme){GUILayout.BeginVertical("Box");}
	        	
	        EditorGUILayout.BeginHorizontal();
	        GUILayout.Space(space+15); 
	        if (script2)
	        {
	        	if (current_layer.output == layer_output_enum.tree)
	        	{
	        		if (current_layer.tree_output.placed_reference){current_layer.tree_output.placed = current_layer.tree_output.placed_reference.placed;}
	        		if (current_layer.tree_output.placed > 0){current_layer.text_placed = "(P "+current_layer.tree_output.placed+")";} else {current_layer.text_placed = String.Empty;}
	        	}
				if (current_layer.output == layer_output_enum.object)
				{
					if (current_layer.object_output.placed_reference){current_layer.object_output.placed = current_layer.object_output.placed_reference.placed;}
					if (current_layer.object_output.placed > 0){current_layer.text_placed = "(P "+current_layer.object_output.placed+")";} else {current_layer.text_placed = String.Empty;}
				}
	        }
	        
	        if (current_layer.text == String.Empty){text += "Layer"+layer_number;} 
	        else 
	        {
	        	text = current_layer.text;
	        	
	        	var display_number: int = text.IndexOf("#n");
	        	if (display_number != -1){text = text.Replace("#n",""+layer_number);}
	        }
	        
	        text += " ("+current_layer.output+") ";
	        if (script.placed_count)
	        {
	        	text += current_layer.text_placed;
	        }
	  
	        // layer text
	        gui_changed_old = GUI.changed;
	        current_layer.foldout = EditorGUILayout.Foldout(current_layer.foldout,text); 
	        GUI.changed = gui_changed_old;
	        if (key.type == EventType.Repaint)
	        {
	        	current_layer.rect = GUILayoutUtility.GetLastRect();
	        	current_layer.rect.width = (text.Length*7)-15;
	        	current_layer.rect.x += 15;
	        }
	        if (check_point_in_rect(current_layer.rect,mouse_position - Vector2(-5,script.settings.top_height)) && key.button == 0 && key.clickCount == 2 && key.type == EventType.layout)
			{
				current_layer.edit = !current_layer.edit;
				this.Repaint();
			}
			if (prelayer.interface_display_layer)
			{
				if (script.settings.tooltip_mode != 0)
				{
					tooltip_text = "Edit Layer name\n\nYou can change Layer names for better overview\nTo display the number type '#n'";
				}
				if (GUILayout.Button(GUIContent("E",tooltip_text),GUILayout.Width(25))){current_layer.edit = !current_layer.edit;}
				if (script.settings.tooltip_mode != 0)
				{
					tooltip_text = "Layer Popup Menu for New/Load/Save and Moving the Layer to another LayerGroup";
				} 
		       	var button_layer: boolean = GUILayout.Button(GUIContent("Layer",tooltip_text),GUILayout.Width(55));
		       	if (key.type == EventType.Repaint) 
				{
	         		current_layer.menu_rect = GUILayoutUtility.GetLastRect();
	         	}
	         	
		       	if (button_layer)
	        	{
	         		current_layer_number = layer_number;
	         		
	         		var menu: GenericMenu;
	         		var userdata: menu_arguments_class[] = new menu_arguments_class[prelayer.predescription.description.Count];
	         		var userdata1: menu_arguments_class[] = new menu_arguments_class[3];
	         		
	         		userdata1[0] = new menu_arguments_class();
	         		userdata1[0].name = "new";
	         		userdata1[1] = new menu_arguments_class();
	         		userdata1[1].name = "open";
	         		userdata1[2] = new menu_arguments_class();
	         		userdata1[2].name = "save";
	         		
	         		menu = new GenericMenu ();                                
	         		if (Application.platform == RuntimePlatform.OSXEditor)
	         		{
		       	 		menu.AddItem (new GUIContent ("New"), false, layer_menu, userdata1[0]);                
		       	 		menu.AddSeparator (""); 
		       	 		menu.AddItem (new GUIContent ("Open"), false, layer_menu, userdata1[1]);                
		       	               
		       	 		menu.AddItem (new GUIContent ("Save"), false, layer_menu, userdata1[2]);                                
		       	 	}
		       	 	else
		       	 	{
		       	 		menu.AddItem (new GUIContent ("File/New"), false, layer_menu, userdata1[0]);                
		       	 		menu.AddSeparator ("File/"); 
		       	 		menu.AddItem (new GUIContent ("File/Open"), false, layer_menu, userdata1[1]);                
		       	               
		       	 		menu.AddItem (new GUIContent ("File/Save"), false, layer_menu, userdata1[2]);
		       	 	}
	         		menu.AddSeparator (""); 
	         		
	         		for (var count_description1: int = 0;count_description1 < prelayer.predescription.description.Count;++count_description1)
	         		{
	         			userdata[count_description1] = new menu_arguments_class();
	         			userdata[count_description1].number0 = count_description;
	         			userdata[count_description1].number1 = count_description1;
	         			userdata[count_description1].name = "parent";
	         			userdata[count_description1].prelayer = prelayer;
	         			userdata[count_description1].number2 = count_layer;
	         			if (Application.platform == RuntimePlatform.OSXEditor)
	         			{
	         				menu.AddItem (new GUIContent("Parent -> "+prelayer.predescription.description[count_description1].text),false,layer_menu,userdata[count_description1]);	
	         			}
	         			else
	         			{
	         				menu.AddItem (new GUIContent("Parent/"+prelayer.predescription.description[count_description1].text),false,layer_menu,userdata[count_description1]);
	         			}
	         		}
	         		
	         		menu.DropDown (current_layer.menu_rect);
	        	}
	           	if (script.settings.toggle_text_no){GUILayout.Space(27);} else {GUILayout.Space(7);}
		    }
		       		
		    if (!script.settings.toggle_text_no)
		    {
		    	if (script.settings.toggle_text_long){EditorGUILayout.LabelField("Active",GUILayout.Width(50));} else {EditorGUILayout.LabelField("Act",GUILayout.Width(28));}
		    }
		    
		    gui_changed_old = GUI.changed;
		    GUI.changed = false;
		    current_layer.active = EditorGUILayout.Toggle(current_layer.active,GUILayout.Width(25)); 
		    if (GUI.changed)
		    {
		    	gui_changed_old = true;
		    }
		    GUI.changed = gui_changed_old;
		        
		    if (prelayer.interface_display_layer)
			{
		    	if (script.settings.tooltip_mode != 0)
				{
					tooltip_text = "Swap Layer with previous";
				} 
		    	if (GUILayout.Button(GUIContent("<",tooltip_text),GUILayout.Width(25)) && layer_number > 0)
		    	{
		    		script.swap_layer(prelayer,layer_number,prelayer,layer_number-1);
		    		if (script.generate_auto){generate_auto();}
		    		this.Repaint();
		    		return;
		    	} 
		    	if (script.settings.tooltip_mode != 0)
				{
					tooltip_text = "Swap Selector -> Click to swap with another Layer\n\n(Alt Click)To copy this Layer\n(Alt Click -> '+' on Layer)To paste";
				}	 		 
		        if (GUILayout.Button(GUIContent(current_layer.swap_text,tooltip_text),GUILayout.Width(35)))
		        {
					swap_layer(current_layer,layer_number,prelayer);
					if (script.generate_auto){generate_auto();}
					this.Repaint();
					return;
		        } 		
		        if (script.settings.tooltip_mode != 0)
				{
					tooltip_text = "Swap Layer with next";
				} 
		        if (GUILayout.Button(GUIContent(">",tooltip_text),GUILayout.Width(25)) && layer_number < prelayer.layer.Count-1)
		        {
		        	script.swap_layer(prelayer,layer_number,prelayer,layer_number+1);
		        	if (script.generate_auto){generate_auto();}
		        	this.Repaint();
		        	return;
		        } 		 
		        if (script.settings.tooltip_mode != 0)
				{
					tooltip_text = "Add a new Layer\n(Click)\n\nDuplicate last Layer\n(Shift Click)";
				}
		        if (GUILayout.Button(GUIContent("+",tooltip_text),GUILayout.Width(25)))
		        {
		        	add_layer(prelayer,layer_number,count_description,count_layer+1);
		        	if (script.generate_auto){generate_auto();}
		        } 	
		        if (script.settings.tooltip_mode != 0)
				{
					tooltip_text = "Erase this Layer\n\n(Control Click)";
				}
		        if (GUILayout.Button(GUIContent("-",tooltip_text),GUILayout.Width(25)) && key.control && prelayer.layer.Count > 0)
		        {
		        	erase_layer(prelayer,layer_number,count_description,count_layer);
		        	if (script.generate_auto){generate_auto();}
		        	this.Repaint();
		        	return;
		        }
		    }
	        	
	        if (current_layer.disable_edit && key.type == EventType.Layout)
		    {
		    	current_layer.edit = false;
		        current_layer.disable_edit = false;
		    }
	        			
	        EditorGUILayout.EndHorizontal();
	        	
	        if (current_layer.edit)
	        {
	        	GUILayout.Space(3);
	        	EditorGUILayout.BeginHorizontal();
	        	GUILayout.Space(space+30);
	        		
	        	gui_changed_old = GUI.changed;
	        	GUI.changed = false;
	        	GUI.SetNextControlName ("la"+count_layer);
	        	current_layer.text = EditorGUILayout.TextField(current_layer.text);
	        	if (key.keyCode == KeyCode.Return  && GUI.GetNameOfFocusedControl() == "la"+count_layer)
	        	{
	        		current_layer.disable_edit = true;
	        	}
	        	if (GUI.changed)
	        	{
	        	
	        	}
	        	EditorGUILayout.EndHorizontal();
		    			
	        	GUI.changed = gui_changed_old;
	        }
	        	
	        if (script.settings.color_scheme){GUI.color = Color.white;}
	       
	        if (current_layer.foldout)
	        {
	        	GUILayout.Space(5);
	           	
	           	EditorGUILayout.BeginHorizontal();
	           	GUILayout.Space(space+30);
	           	gui_changed_old = GUI.changed;
	           	GUI.changed = false;
	           	current_layer.output = EditorGUILayout.EnumPopup("Output",current_layer.output);
	           	if (GUI.changed)
	           	{
	           		gui_changed_old = true;
	           		if (current_layer.output == layer_output_enum.heightmap){script.disable_prefilter_select_mode(current_layer.prefilter);}
	           		current_layer.text_placed = String.Empty;
	           		script.count_layers();
	           	}
	           	GUI.changed = gui_changed_old;
	           	EditorGUILayout.EndHorizontal();
	           	
	           	// heightmap layer
	           	if (current_layer.output == layer_output_enum.heightmap || current_layer.output == layer_output_enum.color || current_layer.output == layer_output_enum.splat)
	           	{
					if (script.terrains.Count > 1)
					{
						EditorGUILayout.BeginHorizontal();
		           		GUILayout.Space(space+30);
		           		EditorGUILayout.LabelField("Stitch Borders",GUILayout.Width(147));
		           		if (!current_layer.height_output){current_layer.height_output = new height_output_class();}
		           		current_layer.stitch = EditorGUILayout.Toggle(current_layer.stitch,GUILayout.Width(25));  
		           		EditorGUILayout.EndHorizontal();
		           	}
		           		
	           		if (current_layer.output == layer_output_enum.heightmap)
	           		{
		           		EditorGUILayout.BeginHorizontal();
			           	GUILayout.Space(space+30);
			           	EditorGUILayout.LabelField("Smooth",GUILayout.Width(147));
			           	current_layer.smooth = EditorGUILayout.Toggle(current_layer.smooth,GUILayout.Width(25));  
			           	EditorGUILayout.EndHorizontal();
			           	
		           		EditorGUILayout.BeginHorizontal();
						GUILayout.Space(space+30);
						EditorGUILayout.LabelField("Strength",GUILayout.Width(147));
						current_layer.strength = EditorGUILayout.Slider(current_layer.strength,0,2);
						EditorGUILayout.EndHorizontal();
						
						EditorGUILayout.BeginHorizontal();
						GUILayout.Space(space+30);
						EditorGUILayout.LabelField("Zoom",GUILayout.Width(147));
						current_layer.zoom = EditorGUILayout.Slider(current_layer.zoom,0,5);
						EditorGUILayout.EndHorizontal();
						if (script.settings.remarks){draw_remarks(current_layer.remarks,space+30);}
						
						EditorGUILayout.BeginHorizontal();
						GUILayout.Space(space+30);
						EditorGUILayout.LabelField("Offset Range",GUILayout.Width(147));
						if (current_layer.offset_range.x < 1){EditorGUILayout.LabelField(current_layer.offset_range.x.ToString("F2"),GUILayout.Width(50));}
							else {EditorGUILayout.LabelField(current_layer.offset_range.x.ToString("F0"),GUILayout.Width(50));}
						if (GUILayout.Button("+",EditorStyles.miniButtonMid,GUILayout.Width(30)))
						{
							current_layer.offset_range.x *= 2;
							current_layer.offset_range.y *= 2;
							current_layer.offset_middle.x = current_layer.offset.x;
							current_layer.offset_middle.y = current_layer.offset.y;
						}
						if (GUILayout.Button("-",EditorStyles.miniButtonMid,GUILayout.Width(30)))
						{
							if (current_layer.offset_range.x > 0.001)
							{
								current_layer.offset_range.x = current_layer.offset_range.x / 2;
								current_layer.offset_range.y = current_layer.offset_range.y / 2;
								current_layer.offset_middle.x = current_layer.offset.x;
								current_layer.offset_middle.y = current_layer.offset.y;
							}
						}
						GUILayout.Space(5);
						if (GUILayout.Button("Randomize",EditorStyles.miniButtonMid,GUILayout.Width(70)))
						{
							UnityEngine.Random.seed = EditorApplication.timeSinceStartup;
							current_layer.offset = Vector2(UnityEngine.Random.Range(-current_layer.offset_range.x+current_layer.offset_middle.x,current_layer.offset_range.y+current_layer.offset_middle.x),UnityEngine.Random.Range(-current_layer.offset_range.y+current_layer.offset_middle.y,current_layer.offset_range.y+current_layer.offset_middle.y));
							if (script.generate_auto){generate_auto();}
						}
						if (GUILayout.Button("Reset",EditorStyles.miniButtonMid,GUILayout.Width(70)))
						{
							current_layer.offset = Vector2(0,0);
							current_layer.offset_middle = Vector2(0,0);
							if (script.generate_auto){generate_auto();}
						}
						EditorGUILayout.EndHorizontal();							
									
						EditorGUILayout.BeginHorizontal();
						GUILayout.Space(space+30);
						EditorGUILayout.LabelField("Offset X",GUILayout.Width(147));
						current_layer.offset.x = EditorGUILayout.Slider(current_layer.offset.x,-current_layer.offset_range.x+current_layer.offset_middle.x,current_layer.offset_range.y+current_layer.offset_middle.x);
						EditorGUILayout.EndHorizontal();
								
						EditorGUILayout.BeginHorizontal();
						GUILayout.Space(space+30);
						EditorGUILayout.LabelField("Offset Y",GUILayout.Width(147));
						current_layer.offset.y = EditorGUILayout.Slider(current_layer.offset.y,-current_layer.offset_range.y+current_layer.offset_middle.y,current_layer.offset_range.y+current_layer.offset_middle.y);
						EditorGUILayout.EndHorizontal();
	           		}
	           		
	           	}
	           	
	           	// colormap	layer     			           			
	           	if (current_layer.output == layer_output_enum.color)
	           	{
	           		EditorGUILayout.BeginHorizontal();
					GUILayout.Space(space+30);
					EditorGUILayout.LabelField("Strength",GUILayout.Width(147));
					current_layer.strength = EditorGUILayout.Slider(current_layer.strength,0,1);
					EditorGUILayout.EndHorizontal();
	           		
	           		if (script.settings.remarks){draw_remarks(current_layer.remarks,space+30);}
	           		
	           		var color_colormap: Color = script.settings.color.color_colormap;
	           		if (script.settings.color_scheme){GUI.color = color_colormap;}
	           		EditorGUILayout.BeginHorizontal();
	           		GUILayout.Space(space+30);
	           		gui_changed_old = GUI.changed;
	           		current_layer.color_output.foldout = EditorGUILayout.Foldout(current_layer.color_output.foldout,current_layer.color_output.color_text);  
	           		GUI.changed = gui_changed_old;
	           		EditorGUILayout.EndHorizontal();
	           		
					if (current_layer.color_output.foldout)
	           		{
	           			EditorGUILayout.BeginHorizontal(); 
	           			GUILayout.Space(space+45);
	           			if (GUILayout.Button("+",GUILayout.Width(25)))
	           			{
	           				current_layer.color_output.set_precolor_range_length(current_layer.color_output.precolor_range.Count+1);
	           				current_layer.color_output.precolor_range[current_layer.color_output.precolor_range.Count-1].one_color = true;
	           				if (script.generate_auto){generate_auto();}
	           			}
        				if (GUILayout.Button("-",GUILayout.Width(25)) && current_layer.color_output.precolor_range.Count > 1 && key.control)
        				{
        					Undo.RegisterUndo(script,"ColorGroup Erase");
	    					current_layer.color_output.set_precolor_range_length(current_layer.color_output.precolor_range.Count-1);
	    					if (script.generate_auto){generate_auto();}
        				} 
	           			EditorGUILayout.EndHorizontal();
	           			
	           			for (var count_precolor_range: int = 0;count_precolor_range < current_layer.color_output.precolor_range.Count;++count_precolor_range)
		           		{
			        		draw_precolor_range(current_layer.color_output.precolor_range[count_precolor_range],space+45,true,0,color_colormap,true,true,true,0);
		           		}
		           	}
		        }
		        
				// splatmap layer
				if (current_layer.output == layer_output_enum.splat)
		        {
		        	EditorGUILayout.BeginHorizontal();
		           	GUILayout.Space(space+30);
		           	gui_changed_old = GUI.changed;
	           		GUI.changed = false;
		           	current_layer.splat_output.splat_terrain = EditorGUILayout.IntField("Terrain",current_layer.splat_output.splat_terrain,GUILayout.Width(200));
		           	if (GUI.changed)
		           	{
						gui_changed_old = true;           	
		           		if (current_layer.splat_output.splat_terrain > script.terrains.Count-1){current_layer.splat_output.splat_terrain = script.terrains.Count-1;}
		           		if (current_layer.splat_output.splat_terrain < 0){current_layer.splat_output.splat_terrain = 0;}
		           	}
		           			
		           	GUI.changed = gui_changed_old;
	           		EditorGUILayout.EndHorizontal();
	           				
	           		EditorGUILayout.BeginHorizontal();
	           		GUILayout.Space(space+30);
		           	current_layer.splat_output.mix_mode = EditorGUILayout.EnumPopup("Mix Mode",current_layer.splat_output.mix_mode,GUILayout.Width(300));
		           	EditorGUILayout.EndHorizontal();
		           	
		           	EditorGUILayout.BeginHorizontal();
	           		GUILayout.Space(space+30);
		           	EditorGUILayout.LabelField("Strength",GUILayout.Width(147));
					current_layer.strength = EditorGUILayout.Slider(current_layer.strength,0,1);
					EditorGUILayout.EndHorizontal();
					
					if (script.settings.remarks)
		           	{
						draw_remarks(current_layer.remarks,space+30);
				    }
		           									
		           	var splat_text: String;
		           	
		           	if (current_layer.splat_output.splat_terrain > script.terrains.Count-1){current_layer.splat_output.splat_terrain = script.terrains.Count-1;}		
		           							
		            if (script.terrains[current_layer.splat_output.splat_terrain].terrain)
		           	{
		           		if (script.terrains[current_layer.splat_output.splat_terrain].terrain.terrainData)
		           		{
			           		if (script.terrains[current_layer.splat_output.splat_terrain].terrain.terrainData.splatPrototypes.Length == 0)
			           		{
				           		splat_text = " --> Please assign splat textures to the ";
				           		if (script.terrains.Count > 1){splat_text += "Terrains.";} else {splat_text += "Terrain.";}
				           	}
				        }
			        }
			        else
			        {
			        	splat_text = " (No terrain assigned)";
			        }
		           	var color_splat: Color = script.settings.color.color_splat;
			        if (script.settings.color_scheme){GUI.color = color_splat;}
		           	EditorGUILayout.BeginHorizontal();
	           		GUILayout.Space(space+30);
	           		gui_changed_old = GUI.changed;
	           		current_layer.splat_output.foldout = EditorGUILayout.Foldout(current_layer.splat_output.foldout,current_layer.splat_output.splat_text+splat_text);  
	           		GUI.changed = gui_changed_old;
	           		EditorGUILayout.EndHorizontal();

					// splat_foldout
	        		if (current_layer.splat_output.foldout)
	        		{
			        	EditorGUILayout.BeginHorizontal(); 
			           	GUILayout.Space(space+45);
			           	if (GUILayout.Button("+",GUILayout.Width(25)))
			           	{
			           		add_splat(current_layer.splat_output,current_layer.splat_output.splat.Count-1,current_layer.splat_output.splat_terrain,key.shift);
			           		if (script.generate_auto){generate_auto();}
			           	}
		        		if (GUILayout.Button("-",GUILayout.Width(25)) && current_layer.splat_output.splat.Count > 0 && key.control)
		        		{
		        			if (!key.shift)
		        			{
		        				Undo.RegisterUndo(script,"Erase Splat");
		        				current_layer.splat_output.erase_splat(current_layer.splat_output.splat.Count-1);
		        			}
		        			else
		        			{
		        				Undo.RegisterUndo(script,"Erase Splats");
		        				current_layer.splat_output.clear_splat();
		        			}
		        			if (script.generate_auto){generate_auto();}
		        			this.Repaint();
		        			return;
		        		} 
		        						
						EditorGUILayout.EndHorizontal();
				        
				        if (current_layer.splat_output.mix_mode == mix_mode_enum.Group && current_layer.splat_output.splat.Count > 0)
				        {
					    	if (script.settings.color_scheme){GUI.color = Color.green;}
					        EditorGUILayout.BeginHorizontal();
					        GUILayout.Space(space+45);
					        EditorGUILayout.LabelField("Mix rate",GUILayout.Width(65));
					        gui_changed_old = GUI.changed;
					        GUI.changed = false;
					        current_layer.splat_output.mix[0] = EditorGUILayout.Slider(current_layer.splat_output.mix[0],0,1);
					        if (GUI.changed)
					        {
					        	gui_changed_old = true;
					        	current_layer.splat_output.set_splat_curve();
			           		}
			           		GUI.changed = gui_changed_old;
					        EditorGUILayout.EndHorizontal();
					        if (script.settings.color_scheme){GUI.color = color_splat;}
					    }
					    
					    for (count_splat = 0;count_splat < current_layer.splat_output.splat.Count;++count_splat)
	           			{
	           				if (script.settings.color_scheme)
	           				{
	           					if (!current_layer.splat_output.splat_value.active[count_splat]){color_splat += Color(-0.3,-0.3,-0.3,0);}
	           				 	GUI.color = color_splat;
	           				}
	           				EditorGUILayout.BeginHorizontal();
	           				GUILayout.Space(space+45); 
	           				if (current_layer.output.splat)
  				        	{				    		
								EditorGUILayout.BeginHorizontal();
						
								if (script.terrains[current_layer.splat_output.splat_terrain].terrain)
								{
									if (current_layer.splat_output.splat[count_splat] < 0)
									{
										current_layer.splat_output.splat[count_splat] = 0;
									}
									if (current_layer.splat_output.splat[count_splat] > script.terrains[current_layer.splat_output.splat_terrain].terrain.terrainData.splatPrototypes.Length-1)
									{
										current_layer.splat_output.splat[count_splat] = script.terrains[current_layer.splat_output.splat_terrain].terrain.terrainData.splatPrototypes.Length-1;
									}
								} 
								
								if (current_layer.splat_output.splat[count_splat] != -1 && script.terrains[current_layer.splat_output.splat_terrain].terrain && script.terrains[current_layer.splat_output.splat_terrain].terrain.terrainData.splatPrototypes.Length >= current_layer.splat_output.splat[count_splat])
								{
									// splat text
									EditorGUILayout.LabelField(""+count_splat+").",GUILayout.Width(27));
									EditorGUILayout.ObjectField(script.terrains[current_layer.splat_output.splat_terrain].terrain.terrainData.splatPrototypes[current_layer.splat_output.splat[count_splat]].texture,Texture,true,GUILayout.Width(50),GUILayout.Height(50));
								}
								current_layer.splat_output.splat[count_splat] = EditorGUILayout.IntField(current_layer.splat_output.splat[count_splat],GUILayout.Width(25));
								if (GUILayout.Button("+",GUILayout.Width(25)))
								{
									if (!key.shift)
									{
										current_layer.splat_output.splat[count_splat] += 1;
									}
									else
									{
										if (count_splat > 0){current_layer.splat_output.splat[count_splat] = current_layer.splat_output.splat[count_splat-1]+1;}
										else {current_layer.splat_output.splat[count_splat] += 1;}
									}
									if (script.generate_auto){generate_auto();}
								}
								if (GUILayout.Button("-",GUILayout.Width(25)))
								{
									current_layer.splat_output.splat[count_splat] -= 1;
									if (script.generate_auto){generate_auto();}
								}
								
								if (!current_layer.splat_output.mix_overview)
								{
									gui_changed_old = GUI.changed;
			           				GUI.changed = false;
									current_layer.splat_output.splat_value.value[count_splat] = EditorGUILayout.Slider(current_layer.splat_output.splat_value.value[count_splat],1,100);
									if (script.settings.tooltip_mode != 0)
						        	{
						        		tooltip_text = "Center this value to 50";
						        	}
									if (GUILayout.Button(GUIContent("C",tooltip_text),GUILayout.Width(25)))
									{
										current_layer.splat_output.splat_value.value[count_splat] = 50;
										GUI.changed = true;
										if (script.generate_auto){generate_auto();}
									}
									EditorGUILayout.LabelField(current_layer.splat_output.splat_value.text[count_splat],GUILayout.Width(90));
									if (GUI.changed)
									{
										gui_changed_old = true;
										current_layer.splat_output.splat_value.calc_value();
									}
									GUI.changed = gui_changed_old;
								}
								EditorGUILayout.EndHorizontal();
							}
							
	           				if (!script.settings.toggle_text_no)
					        {
					        	if (script.settings.toggle_text_long){EditorGUILayout.LabelField("Active",GUILayout.Width(50));} else {EditorGUILayout.LabelField("Act",GUILayout.Width(28));}
					        }
					         
					        gui_changed_old = GUI.changed;
					        GUI.changed = false;
					        current_layer.splat_output.splat_value.active[count_splat] = EditorGUILayout.Toggle(current_layer.splat_output.splat_value.active[count_splat],GUILayout.Width(25));
					        if (GUI.changed)
					        {
					        	gui_changed_old = true;
					        	current_layer.splat_output.splat_value.calc_value();
					        	current_layer.splat_output.set_splat_curve();
		           			}
							GUI.changed = gui_changed_old;
								 
	           				if (script.settings.display_mix_curves){current_layer.splat_output.curves[count_splat].curve = EditorGUILayout.CurveField(current_layer.splat_output.curves[count_splat].curve);}
	           			     
	           			    if (GUILayout.Button("<",GUILayout.Width(25)) && count_splat > 0)
	           			    {
	           			    	current_layer.splat_output.swap_splat(count_splat,count_splat-1);
	           			    	if (script.generate_auto){generate_auto();}
	           			    } 		 
	           			    if (GUILayout.Button(">",GUILayout.Width(25)) && count_splat < current_layer.splat_output.splat.Count-1)
	           			    {
	           			    	current_layer.splat_output.swap_splat(count_splat,count_splat+1);
	           			    	if (script.generate_auto){generate_auto();}
	           			    } 		 
	           			    if (GUILayout.Button("+",GUILayout.Width(25)))
	           			    {
	           			    	add_splat(current_layer.splat_output,count_splat,current_layer.splat_output.splat_terrain,key.shift);
	           			    	if (script.generate_auto){generate_auto();}
	           			    } 		 
	           			    if (GUILayout.Button("-",GUILayout.Width(25)) && key.control && current_layer.splat_output.splat.Count > 0)
	           			    {
	           			    	current_layer.splat_output.erase_splat(count_splat);
	           			    	if (script.generate_auto){generate_auto();}
	           			     	this.Repaint();
	           			     	return;
	           			    } 		 
	           				EditorGUILayout.EndHorizontal();
	           				 
	           				if (script.settings.color_scheme)
	           				{
	           					if (!current_layer.splat_output.splat_value.active[count_splat]){color_splat += Color(0.3,0.3,0.3,0);}
	           				 	GUI.color = color_splat;
	           				}
	           				if (current_layer.splat_output.mix_mode == mix_mode_enum.Single && count_splat < current_layer.splat_output.splat.Count-1)
				            {
					        	if (script.settings.color_scheme)
					         	{
					         		GUI.color = Color.green;
					         	}
					         	EditorGUILayout.BeginHorizontal();
					           	GUILayout.Space(space+95);
					           	EditorGUILayout.LabelField("Mix rate",GUILayout.Width(55));
					           	gui_changed_old = GUI.changed;
					           	GUI.changed = false;
					           	current_layer.splat_output.mix[count_splat+1] = EditorGUILayout.Slider(current_layer.splat_output.mix[count_splat+1],0,1);
					           	if (GUI.changed)
					           	{
					           		gui_changed_old = true;
					           		current_layer.splat_output.set_splat_curve();
			           			}
			           			GUI.changed = gui_changed_old;
					           	EditorGUILayout.EndHorizontal();
					           	if (script.settings.color_scheme){GUI.color = color_splat;}
					         }
					    }
					}
	           	}
	        	
	        	// tree layer
		        if (current_layer.output == layer_output_enum.tree)
		        {
		        	if (current_layer.tree_output.tree_terrain != -1)
		           	{
		           		if (!current_layer.tree_output.tree_terrain_set && script.terrains[current_layer.tree_output.tree_terrain].terrain)
		           		{
		           			current_layer.tree_output.tree_terrain_set = true;
		           			var tree_length: int = 1;
		           			if (script.terrains[current_layer.tree_output.tree_terrain].terrain.terrainData.treePrototypes.Length > 0)
		           			{
		           				tree_length = script.terrains[current_layer.tree_output.tree_terrain].terrain.terrainData.treePrototypes.Length;
		           			}
		           			for (var count_tree: int = 0;count_tree < current_layer.tree_output.tree.Count;++count_tree)
		           			{
		           				current_layer.tree_output.tree[count_tree].filter_index[0].foldout = false;
		           				current_layer.tree_output.tree[count_tree].filter_index[0].type = condition_type_enum.Random;
		           				current_layer.tree_output.tree[count_tree].prototypeindex = count_tree;
		           			}
		           		}
		           	} else {current_layer.tree_output.tree_terrain_set = false;}
	        	
		           	EditorGUILayout.BeginHorizontal();
		           	GUILayout.Space(space+30);
		           	gui_changed_old = GUI.changed;
		           	GUI.changed = false;
		           	current_layer.tree_output.tree_terrain = EditorGUILayout.IntField("Terrain",current_layer.tree_output.tree_terrain,GUILayout.Width(200));
		           	if (GUI.changed)
		           	{
		           		gui_changed_old = true;
		           		if (current_layer.tree_output.tree_terrain > script.terrains.Count-1){current_layer.tree_output.tree_terrain = script.terrains.Count-1;}
		           		if (current_layer.tree_output.tree_terrain < 0){current_layer.tree_output.tree_terrain = 0;}
		           	}
		           	GUI.changed = gui_changed_old;
		           	EditorGUILayout.EndHorizontal();
		           			
		           	var tree_output_text: String;
		           	if (script.terrains[current_layer.tree_output.tree_terrain].terrain)
		           	{
		           		if (script.terrains[current_layer.tree_output.tree_terrain].terrain.terrainData.treePrototypes.Length == 0)
			           	{
			           		tree_output_text = " (No trees defined)";
		        		}
		        	}
		           	if (script.settings.remarks){draw_remarks(current_layer.remarks,space+30);}		
		           	var color_tree: Color = script.settings.color.color_tree;
		           	
			        if (script.settings.color_scheme){GUI.color = color_tree;}			           		
		           	EditorGUILayout.BeginHorizontal();
	           		GUILayout.Space(space+30);
	           		gui_changed_old = GUI.changed;
	           		current_layer.tree_output.foldout = EditorGUILayout.Foldout(current_layer.tree_output.foldout,current_layer.tree_output.tree_text+tree_output_text);  
	           		GUI.changed = gui_changed_old;
	           		EditorGUILayout.EndHorizontal();
  	
					// tree_foldout
	        		if (current_layer.tree_output.foldout && current_layer.tree_output.tree_terrain_set && script.terrains[current_layer.tree_output.tree_terrain].terrain)
	        		{
			        	EditorGUILayout.BeginHorizontal(); 
			           	GUILayout.Space(space+45);
		        		if (GUILayout.Button("+",GUILayout.Width(25)))
		        		{
		        			add_tree(current_layer.tree_output.tree.Count-1,current_layer.tree_output,current_layer.tree_output.tree_terrain);
		        		}
		        		if (GUILayout.Button("-",GUILayout.Width(25)) && key.control)
		        		{
		        			if (!key.shift)
		        			{
		        				Undo.RegisterUndo(script,"Erase Tree");
		        				erase_tree(current_layer.tree_output.tree.Count-1,current_layer.tree_output);
		        			}
		        			else
		        			{
		        				Undo.RegisterUndo(script,"Erase Trees");
		        				current_layer.tree_output.clear_tree(script);
		        			}
		        			if (script.generate_auto){generate_auto();}
		        			this.Repaint();
		        			return;
		        		} 
		        			
		        		if (GUILayout.Button("F",GUILayout.Width(20)))
						{
							current_layer.tree_output.trees_foldout = !current_layer.tree_output.trees_foldout;
							script.change_trees_foldout(current_layer.tree_output,key.shift);
						}
		        		if (GUILayout.Button("A",GUILayout.Width(20)))
						{
							current_layer.tree_output.trees_active = !current_layer.tree_output.trees_active;
							script.change_trees_active(current_layer.tree_output,key.shift);
						}
						if (script.settings.tooltip_mode != 0)
						{
							tooltip_text = "Show/Hide Layer Interface Buttons\n(Click)\n\nShow/Hide Tree Icons\n(Shift Click)";
						}
						if (GUILayout.Button(GUIContent("»I",tooltip_text),GUILayout.Width(25)))
						{
							if (!key.shift){current_layer.tree_output.interface_display = !current_layer.tree_output.interface_display;}
							else
							{
								current_layer.tree_output.icon_display = !current_layer.tree_output.icon_display;
							}
						}
						EditorGUILayout.EndHorizontal();
			            
			            EditorGUILayout.BeginHorizontal();
						GUILayout.Space(space+45);
						EditorGUILayout.LabelField("Strength",GUILayout.Width(147));
						current_layer.strength = EditorGUILayout.Slider(current_layer.strength,0,1);
						
						EditorGUILayout.EndHorizontal();  		
			            EditorGUILayout.BeginHorizontal(); 
			           	GUILayout.Space(space+45);
		        		EditorGUILayout.LabelField("Scale",GUILayout.Width(147));
		        		current_layer.tree_output.scale = EditorGUILayout.Slider(current_layer.tree_output.scale,0,30,GUILayout.Width(200));
			            EditorGUILayout.EndHorizontal();
			            
			            for (count_tree = 0;count_tree < current_layer.tree_output.tree.Count;++count_tree)
		           		{
		           	   		var current_tree: tree_class = current_layer.tree_output.tree[count_tree];
		           	   		current_tree_number = count_tree;
		           	   		if (!current_layer.tree_output.tree_value.active[count_tree])
							{
								color_tree += Color(-0.2,-0.2,-0.2,0);
							}
		           	   		
		           			if (current_tree.color_tree != color_tree)
		           			{
		           				if (current_tree.color_tree[0] > 2){this.ShowNotification(GUIContent("Nice effect, isn't it? ;)"));}
		           				if (current_tree.color_tree[0] > color_tree[0]){current_tree.color_tree[0] -= 0.003;} 
		           					else if (current_tree.color_tree[0]+0.01 < color_tree[0]){current_tree.color_tree[0] += 0.003;}	
		           						else {current_tree.color_tree[0] = color_tree[0];}
		           				if (current_tree.color_tree[1] > color_tree[1]){current_tree.color_tree[1] -= 0.003;} 
		           					else if (current_tree.color_tree[1]+0.01 < color_tree[1]){current_tree.color_tree[1] += 0.003;}
		           						else {current_tree.color_tree[1] = color_tree[1];}
		           				if (current_tree.color_tree[2] > color_tree[2]){current_tree.color_tree[2] -= 0.003;} 
		           					else if (current_tree.color_tree[2]+0.01 < color_tree[2]){current_tree.color_tree[2] += 0.003;}
		           						else {current_tree.color_tree[2] = color_tree[2];}
		           				if (current_tree.color_tree[3] > color_tree[3]){current_tree.color_tree[3] -= 0.003;} 
		           					else if (current_tree.color_tree[3]+0.01 < color_tree[3]){current_tree.color_tree[3] += 0.003;}
		           						else {current_tree.color_tree[3] = color_tree[3];}
		           				this.Repaint();
		           			}
		           			color_tree = current_tree.color_tree;
		           			
		           			
							if (script.settings.color_scheme){GUI.color = color_tree;}
		           				 
		           			if (current_tree.prototypeindex > script.terrains[current_layer.tree_output.tree_terrain].treePrototypes.Count-1)
		           			{
		           				if (current_tree.prototypeindex > script.terrains[current_layer.tree_output.tree_terrain].terrain.terrainData.treePrototypes.Length)
		           				{
		           					current_tree.prototypeindex = -1;
		           				}
		           				else
		           				{
		           					--current_tree.prototypeindex;
		           				}
		           				 	
		           			}
		           			if (current_layer.tree_output.tree_terrain_set && current_layer.output == layer_output_enum.tree && script.terrains[current_layer.tree_output.tree_terrain].terrain)
	  				        {				    		
								EditorGUILayout.BeginHorizontal();
		           				GUILayout.Space(space+45); 
								
	        					if (current_layer.tree_output.icon_display)
	        					{
		        					if (script.settings.color_scheme){GUI.color = Color.white;}
		        					if (script.terrains[current_layer.tree_output.tree_terrain].treePrototypes.Count > 0)
		        					{
			        					if (current_tree.prototypeindex == -1){GUILayout.Button(GUIContent("Not\nAssigned"),EditorStyles.miniButtonMid,GUILayout.Width(64),GUILayout.Height(64));}
			        					else
			        					{
				        					if (!script.terrains[current_layer.tree_output.tree_terrain].treePrototypes[current_tree.prototypeindex].prefab){GUILayout.Button(GUIContent("Empty"),EditorStyles.miniButtonMid,GUILayout.Width(64),GUILayout.Height(64));}
							        		else
							        		{
												#if !UNITY_3_4 && !UNITY_3_5
											    script.terrains[current_layer.tree_output.tree_terrain].treePrototypes[current_tree.prototypeindex].texture = AssetPreview.GetAssetPreview(script.terrains[current_layer.tree_output.tree_terrain].treePrototypes[current_tree.prototypeindex].prefab);
												#else
											    script.terrains[current_layer.tree_output.tree_terrain].treePrototypes[current_tree.prototypeindex].texture = EditorUtility.GetAssetPreview(script.terrains[current_layer.tree_output.tree_terrain].treePrototypes[current_tree.prototypeindex].prefab);
											    #endif
								        		
								        		if (script.settings.tooltip_mode == 2)
												{
													tooltip_text = "Click to preview\n\nClick again to close preview";
												} else {tooltip_text = "";}
								        		if (GUILayout.Button(GUIContent(script.terrains[current_layer.tree_output.tree_terrain].treePrototypes[current_tree.prototypeindex].texture,tooltip_text),EditorStyles.miniButtonMid,GUILayout.Width(64),GUILayout.Height(64))){create_preview_window(script.terrains[current_layer.tree_output.tree_terrain].treePrototypes[current_tree.prototypeindex].texture,"Tree Preview");}
								        		if (script.settings.color_scheme){GUI.color = color_tree;}
								        	}	 
								        }
							       	}else {GUILayout.Button(GUIContent("Not\nAssigned"),EditorStyles.miniButtonMid,GUILayout.Width(64),GUILayout.Height(64));}
								}
								
								var tree_text: String = "Tree not set";
								if (current_tree.prototypeindex != -1){tree_text = script.terrains[current_layer.tree_output.tree_terrain].terrain.terrainData.treePrototypes[current_tree.prototypeindex].prefab.name;}
								
								// tree counter
			           		    if (script2)
			           		    {
			           		    	if (current_tree.placed_reference)
			           		     	{
			           		     		current_tree.placed = current_tree.placed_reference.placed;
			           		    	}
				           		}
				           		    
				           		if (script.placed_count)
				           		{
				           			if (current_tree.placed > 0){tree_text += " (P "+current_tree.placed+")";}
				           		}
			
								// tree text
								gui_changed_old = GUI.changed;
								current_tree.foldout = EditorGUILayout.Foldout(current_tree.foldout,count_tree+"). "+tree_text);
								GUI.changed = gui_changed_old;
								GUILayout.Space(85);
								
								gui_changed_old = GUI.changed;
								GUI.changed = false;
								current_tree.prototypeindex = EditorGUILayout.IntField(current_tree.prototypeindex,GUILayout.Width(25));
								if (GUILayout.Button("+",GUILayout.Width(25)))
								{
									if (!key.shift)
									{
										current_tree.prototypeindex += 1;
									}
									else
									{
										if (count_tree > 0){current_tree.prototypeindex = current_layer.tree_output.tree[count_tree-1].prototypeindex+1;}
										else {current_tree.prototypeindex += 1;}
									}
									if (script.generate_auto){generate_auto();}
								}
								if (GUILayout.Button("-",GUILayout.Width(25)) && current_tree.prototypeindex > 0)
								{
									current_tree.prototypeindex -= 1;
									if (script.generate_auto){generate_auto();}
								}
								if (current_tree.prototypeindex > script.terrains[current_layer.tree_output.tree_terrain].terrain.terrainData.treePrototypes.Length-1)
								{
									current_tree.prototypeindex = script.terrains[current_layer.tree_output.tree_terrain].terrain.terrainData.treePrototypes.Length-1;
								}
								if (current_tree.prototypeindex < 0)
								{
									current_tree.prototypeindex = 0;
								}
								if (GUI.changed)
								{
									gui_changed_old = true;
									if (script.terrains[current_layer.tree_output.tree_terrain].terrain.terrainData.treePrototypes.Length > 0){current_tree.count_mesh(script.terrains[current_layer.tree_output.tree_terrain].treePrototypes[current_tree.prototypeindex].prefab);}
								}
								
		           				GUI.changed = false;
								current_layer.tree_output.tree_value.value[count_tree] = EditorGUILayout.Slider(current_layer.tree_output.tree_value.value[count_tree],0.1,100);
								if (script.settings.tooltip_mode != 0)
						       	{
						        	tooltip_text = "Center this value to 50";
						        }
								if (GUILayout.Button(GUIContent("C",tooltip_text),GUILayout.Width(25))){current_layer.tree_output.tree_value.value[count_tree] = 50;GUI.changed = true;}
								EditorGUILayout.LabelField(current_layer.tree_output.tree_value.text[count_tree],GUILayout.Width(90));
								if (GUI.changed)
								{
									gui_changed_old = true;
									current_layer.tree_output.tree_value.calc_value();
								}
								GUI.changed = gui_changed_old;
							}		
							if (!script.settings.toggle_text_no)
					        {
					        	if (script.settings.toggle_text_long){EditorGUILayout.LabelField("Active",GUILayout.Width(50));} else {EditorGUILayout.LabelField("Act",GUILayout.Width(28));}
					        }
					        gui_changed_old = GUI.changed;
					        GUI.changed = false;
					        current_layer.tree_output.tree_value.active[count_tree] = EditorGUILayout.Toggle(current_layer.tree_output.tree_value.active[count_tree],GUILayout.Width(25));
					        if (GUI.changed)
					        {
					        	gui_changed_old = true;
					        	current_layer.tree_output.tree_value.calc_value();
					        }
							GUI.changed = gui_changed_old;
								 	 
							if (current_layer.tree_output.interface_display)
							{
		           				if (GUILayout.Button("<",GUILayout.Width(25)) && count_tree > 0){current_layer.tree_output.swap_tree(count_tree,count_tree-1);} 		 
			           			if (GUILayout.Button(current_tree.swap_text,GUILayout.Width(35)))
			           			{
			           				swap_tree(current_layer.tree_output,count_tree);
			           			} 		 
			           			if (GUILayout.Button(">",GUILayout.Width(25)) && count_tree < current_layer.tree_output.tree.Count-1){current_layer.tree_output.swap_tree(count_tree,count_tree+1);}
			           			if (GUILayout.Button("+",GUILayout.Width(25)))
			           			{
			           				add_tree(count_tree,current_layer.tree_output,current_layer.tree_output.tree_terrain);
			           			}	 
			           			if (GUILayout.Button("-",GUILayout.Width(25)) && key.control){erase_tree(count_tree,current_layer.tree_output);this.Repaint();return;}
			           		}
		           			EditorGUILayout.EndHorizontal();
		           			
		           			if (current_tree.foldout)
		           			{
			           			EditorGUILayout.BeginHorizontal();
						        GUILayout.Space(space+60);
						        gui_changed_old = GUI.changed;
						        current_tree.data_foldout = EditorGUILayout.Foldout(current_tree.data_foldout,"Data");
						        GUI.changed = gui_changed_old;
						        EditorGUILayout.EndHorizontal(); 
									 	
								if (current_tree.data_foldout)
			    	     		{
				    	     		EditorGUILayout.BeginHorizontal();
					           		GUILayout.Space(space+75);
					           		EditorGUILayout.LabelField("Vertices length",GUILayout.Width(140));
					           		EditorGUILayout.LabelField(""+current_tree.mesh_length,GUILayout.Width(140));
					           		EditorGUILayout.EndHorizontal();
					           					
					           		EditorGUILayout.BeginHorizontal();
					           		GUILayout.Space(space+75);
					           		EditorGUILayout.LabelField("Trianlges length",GUILayout.Width(140));
					           		EditorGUILayout.LabelField(""+current_tree.mesh_triangles/3,GUILayout.Width(140));
					           		EditorGUILayout.EndHorizontal();
					           				 
					           		EditorGUILayout.BeginHorizontal();
					           		GUILayout.Space(space+75);
					           		EditorGUILayout.LabelField("Combine max",GUILayout.Width(140));
					           		EditorGUILayout.LabelField(""+current_tree.mesh_combine,GUILayout.Width(140));
					           		EditorGUILayout.EndHorizontal();
				    	     				 	
				    	     		EditorGUILayout.BeginHorizontal();
					           		GUILayout.Space(space+75);
					           		EditorGUILayout.LabelField("Size",GUILayout.Width(140));
					           		EditorGUILayout.LabelField(""+current_tree.mesh_size,GUILayout.Width(170));
					           		EditorGUILayout.EndHorizontal();
					           				 	
					           		EditorGUILayout.BeginHorizontal();
					           		GUILayout.Space(space+75);
					           		EditorGUILayout.LabelField("Size Scale",GUILayout.Width(140));
					           		EditorGUILayout.LabelField(""+current_tree.mesh_size*current_layer.tree_output.scale,GUILayout.Width(170));
					           		EditorGUILayout.EndHorizontal();
					           	}	
		           				
		           				EditorGUILayout.BeginHorizontal();
						        GUILayout.Space(space+60);
						        gui_changed_old = GUI.changed;
						        current_tree.scale_foldout = EditorGUILayout.Foldout(current_tree.scale_foldout,"Scale");
						        GUI.changed = gui_changed_old;
						        EditorGUILayout.EndHorizontal(); 
		           				
		           				if (current_tree.scale_foldout)
		           				{
			           				GUILayout.Space(5);
			           				EditorGUILayout.BeginHorizontal();
				           			GUILayout.Space(space+75);
				           			EditorGUILayout.LabelField("Height",GUILayout.Width(85));
				           			GUILayout.Space(29);
				           			current_tree.height_start = EditorGUILayout.FloatField(Mathf.Round(current_tree.height_start*100)/100,GUILayout.Width(35));
				           			EditorGUILayout.MinMaxSlider(current_tree.height_start,current_tree.height_end,0,30);
				           			current_tree.height_end = EditorGUILayout.FloatField(Mathf.Round(current_tree.height_end*100)/100,GUILayout.Width(35));
				           			GUILayout.Space(29);
				           			EditorGUILayout.EndHorizontal();
				           			
				           			EditorGUILayout.BeginHorizontal();
				           			GUILayout.Space(space+75);
				           			EditorGUILayout.LabelField("Width ",GUILayout.Width(85));
				           			current_tree.link_start = EditorGUILayout.Toggle(current_tree.link_start,GUILayout.Width(25));
				           			current_tree.width_start = EditorGUILayout.FloatField(Mathf.Round(current_tree.width_start*100)/100,GUILayout.Width(35));
				           			EditorGUILayout.MinMaxSlider(current_tree.width_start,current_tree.width_end,0,30);
				           			current_tree.width_end = EditorGUILayout.FloatField(Mathf.Round(current_tree.width_end*100)/100,GUILayout.Width(35));
				           			current_tree.link_end = EditorGUILayout.Toggle(current_tree.link_end,GUILayout.Width(25));
				           			 			
				           			if (current_tree.link_start){current_tree.width_start = current_tree.height_start;}
				           			if (current_tree.width_start > current_tree.width_end){current_tree.width_start = current_tree.width_end;}
				           			if (current_tree.width_end < current_tree.width_start){current_tree.width_end = current_tree.width_start;}
				           			EditorGUILayout.EndHorizontal();
				           						           				 			
				           			EditorGUILayout.BeginHorizontal();
				           			GUILayout.Space(space+75);
				           			EditorGUILayout.LabelField("Unlink",GUILayout.Width(115));
				           			current_tree.unlink = EditorGUILayout.Slider(current_tree.unlink,0,2,GUILayout.Width(267));
				           			EditorGUILayout.EndHorizontal();
				           			
				           			if (current_tree.link_end){current_tree.width_end = current_tree.height_end;}
				           			
				           			if (script.settings.tooltip_mode != 0)
				           			{
				           				tooltip_text = "Set these Scale Parameters to all active Trees in this Layer (Click)\n\nSet these Scale Parameters to all Trees in this Layer (Shift Click)";
				           			}
				           			
				           			EditorGUILayout.BeginHorizontal();
				           			GUILayout.Space(space+75);
				           			EditorGUILayout.LabelField("Random Position",GUILayout.Width(115));
				           			current_tree.random_position = EditorGUILayout.Toggle(current_tree.random_position,GUILayout.Width(25));
				           	   		EditorGUILayout.EndHorizontal();	
				           			
				           			if (current_layer.tree_output.tree.Count > 1)
				           			{
					           			EditorGUILayout.BeginHorizontal();
					           			GUILayout.Space(space+75);
					           			if (GUILayout.Button(GUIContent(">Set All",tooltip_text),GUILayout.Width(65)))
						           		{
						           			Undo.RegisterUndo(script,"Set All Scale Trees");
						           			current_layer.tree_output.set_scale(current_tree,count_tree,key.shift);	
						           			if (script.generate_auto){generate_auto();}
						           		}
						           		EditorGUILayout.EndHorizontal();
						           	}
				           		}
			           			
			           			EditorGUILayout.BeginHorizontal();
				           		GUILayout.Space(space+60);
				           		gui_changed_old = GUI.changed;
				           		current_tree.distance_foldout = EditorGUILayout.Foldout(current_tree.distance_foldout,"Distance");
				           		GUI.changed = gui_changed_old;
				           		EditorGUILayout.EndHorizontal();
				           				
				           		if (current_tree.distance_foldout)
				           		{ 
					           		EditorGUILayout.BeginHorizontal();
					           		GUILayout.Space(space+75);
					           		EditorGUILayout.LabelField("Distance Level",GUILayout.Width(140));
					           		current_tree.distance_level = EditorGUILayout.EnumPopup(current_tree.distance_level,GUILayout.Width(250));
					           		EditorGUILayout.EndHorizontal();
					           		
					        		if (current_tree.distance_mode == distance_mode_enum.Square)
									{
										EditorGUILayout.BeginHorizontal();
						        		GUILayout.Space(space+75);
						        		EditorGUILayout.LabelField("Distance Rotation",GUILayout.Width(140));
						        		current_tree.distance_rotation_mode = EditorGUILayout.EnumPopup(current_tree.distance_rotation_mode,GUILayout.Width(250));
						        		EditorGUILayout.EndHorizontal();
											
										EditorGUILayout.BeginHorizontal();
						           		GUILayout.Space(space+75);
						           		EditorGUILayout.LabelField("Min. Distance X",GUILayout.Width(140));
						           		current_tree.min_distance.x = EditorGUILayout.Slider(current_tree.min_distance.x,0,2048,GUILayout.Width(250));
						           		EditorGUILayout.EndHorizontal();
						           				
						           		EditorGUILayout.BeginHorizontal();
						           		GUILayout.Space(space+75);
						           		EditorGUILayout.LabelField("Min. Distance Z",GUILayout.Width(140));
						           		current_tree.min_distance.z = EditorGUILayout.Slider(current_tree.min_distance.z,0,2048,GUILayout.Width(250));
						           		EditorGUILayout.EndHorizontal();
						           	}
						           	else
						           	{
						           		EditorGUILayout.BeginHorizontal();
						           		GUILayout.Space(space+75);
						           		EditorGUILayout.LabelField("Min. Distance",GUILayout.Width(140));
						           		current_tree.min_distance.x = EditorGUILayout.Slider(current_tree.min_distance.x,0,2048,GUILayout.Width(250));
						           		EditorGUILayout.EndHorizontal();
						           	}
						           			
						           	EditorGUILayout.BeginHorizontal();
						           	GUILayout.Space(space+75);
						           	EditorGUILayout.LabelField("Include Scale",GUILayout.Width(140));
						           	current_tree.distance_include_scale = EditorGUILayout.Toggle(current_tree.distance_include_scale,GUILayout.Width(25));
						           	EditorGUILayout.EndHorizontal();
						           			
						           	EditorGUILayout.BeginHorizontal();
						           	GUILayout.Space(space+75);
						           	EditorGUILayout.LabelField("Include Scale Group",GUILayout.Width(140));
						           	current_tree.distance_include_scale_group = EditorGUILayout.Toggle(current_tree.distance_include_scale_group,GUILayout.Width(25));
						           	EditorGUILayout.EndHorizontal();
						           	
						           	if (script.settings.tooltip_mode != 0)
				           			{
				           				tooltip_text = "Set these Distance Parameters to all active Trees in this Layer (Click)\n\nSet this Distance Parameters to all Trees in this Layer (Shift Click)";
				           			}
						           	
						           	if (current_layer.tree_output.tree.Count > 1)
						           	{
							           	EditorGUILayout.BeginHorizontal();
					           			GUILayout.Space(space+75);
					           			if (GUILayout.Button(GUIContent(">Set All",tooltip_text),GUILayout.Width(65)))
					           			{
					           				Undo.RegisterUndo(script,"Set All Distance Trees");
					           				if (script.generate_auto){generate_auto();}
					           				current_layer.tree_output.set_distance(current_tree,count_tree,key.shift);	
					           			}
					           			EditorGUILayout.EndHorizontal();
						           	}
						        }
		           				draw_precolor_range(current_tree.precolor_range,space+60,false,0,script.settings.color.color_tree_precolor_range,true,true,false,3);
				           		draw_filter(prelayer,current_tree.prefilter,script.filter,space+15+script.description_space,script.settings.color.color_tree_filter,script.settings.color.color_tree_subfilter,1,count_tree);
		           		}
		           		color_tree = script.settings.color.color_tree;
		           		if (!current_layer.tree_output.tree_value.active[count_tree])
						{
							if (script.settings.color_scheme){GUI.color = color_tree;}
		           		}
		           	}
				}GUILayout.Space(1); 
			}
			
			// grass layer	
			if (current_layer.output == layer_output_enum.grass)
		    {
		    	if (current_layer.grass_output.grass_terrain != -1)
		        {
		        	if (!current_layer.grass_output.grass_terrain_set)
		           	{
		           		current_layer.grass_output.grass_terrain_set = true;
		           		current_layer.grass_output.set_grass_text();
		           		for (var count_grass: int = 0;count_grass < current_layer.grass_output.grass.Count;++count_grass)
		           		{
		           			current_layer.grass_output.grass[count_grass].prototypeindex = count_grass;
		           		}
		           	}
				} else {current_layer.grass_output.grass_terrain_set = false;}
	        	
		        EditorGUILayout.BeginHorizontal();
		        GUILayout.Space(space+30);
		        gui_changed_old = GUI.changed;
		        GUI.changed = false;
		        current_layer.grass_output.grass_terrain = EditorGUILayout.IntField("Terrain",current_layer.grass_output.grass_terrain,GUILayout.Width(200));
		        if (GUI.changed)
		        {
		        	gui_changed_old = true;
		        	if (current_layer.grass_output.grass_terrain > script.terrains.Count-1){current_layer.grass_output.grass_terrain = script.terrains.Count-1;}
		           	if (current_layer.grass_output.grass_terrain < 0){current_layer.grass_output.grass_terrain = 0;}
		        }
		        
		        GUI.changed = gui_changed_old;
		        EditorGUILayout.EndHorizontal();
		        
		        EditorGUILayout.BeginHorizontal();
	           	GUILayout.Space(space+30);
		        current_layer.grass_output.mix_mode = EditorGUILayout.EnumPopup("Mix Mode",current_layer.grass_output.mix_mode,GUILayout.Width(300));
		        EditorGUILayout.EndHorizontal();
		        
		        if (script.settings.remarks){draw_remarks(current_layer.remarks,space+30);}
		        
		        var color_grass: Color = script.settings.color.color_grass;
			    if (script.settings.color_scheme){GUI.color = color_grass;}
		        EditorGUILayout.BeginHorizontal();
	           	GUILayout.Space(space+30);
	           	gui_changed_old = GUI.changed;
	           	current_layer.grass_output.foldout = EditorGUILayout.Foldout(current_layer.grass_output.foldout,current_layer.grass_output.grass_text);  
	           	GUI.changed = gui_changed_old;
	           	EditorGUILayout.EndHorizontal();
  	  			
  	 			// grass_foldout
	        	if (current_layer.grass_output.foldout && current_layer.grass_output.grass_terrain_set && script.terrains[current_layer.grass_output.grass_terrain])
	        	{
			    	EditorGUILayout.BeginHorizontal(); 
			        GUILayout.Space(space+45);
			        if (GUILayout.Button("+",GUILayout.Width(25)))
			        {
			        	add_grass(current_layer.grass_output,current_layer.grass_output.grass.Count-1,current_layer.grass_output.grass_terrain,key.shift);
			        }
		        	if (GUILayout.Button("-",GUILayout.Width(25)) && key.control)
		        	{
		        		if (!key.shift)
		        		{
		        			Undo.RegisterUndo(script,"Erase Grass");
							current_layer.grass_output.erase_grass(current_layer.grass_output.grass.Count-1);
						}
						else
						{
							Undo.RegisterUndo(script,"Erase Grasses");
							current_layer.grass_output.clear_grass();
						}
		        		this.Repaint();
		        		return;
		        	} 
			        EditorGUILayout.EndHorizontal();
			        
			        EditorGUILayout.BeginHorizontal();
					GUILayout.Space(space+45);
					EditorGUILayout.LabelField("Strength",GUILayout.Width(60));
					if (script.settings.resolution_density)
					{
						if ((current_layer.strength/((script.terrains[current_layer.grass_output.grass_terrain].prearea.resolution*script.settings.resolution_density_conversion)*(script.terrains[current_layer.grass_output.grass_terrain].prearea.resolution*script.settings.resolution_density_conversion)))*script.settings.grass_density < 1)
						{
							GUI.backgroundColor = Color.red;				
						}
					}
					else
					{
						if (current_layer.strength*script.settings.grass_density < 1){GUI.backgroundColor = Color.red;}
					}
					current_layer.strength = EditorGUILayout.Slider(current_layer.strength,0,1);
					GUI.backgroundColor = Color.white;
					EditorGUILayout.EndHorizontal();
			        
			        if (current_layer.grass_output.mix_mode == mix_mode_enum.Group)
				    {
						if (script.settings.color_scheme){GUI.color = Color.green;}
					    
					    if (current_layer.grass_output.grass.Count > 0)
					    {
						    EditorGUILayout.BeginHorizontal();
						    GUILayout.Space(space+45);
						    EditorGUILayout.LabelField("Mix rate",GUILayout.Width(60));
						    gui_changed_old = GUI.changed;
						    GUI.changed = false;
						    current_layer.grass_output.mix[0] = EditorGUILayout.Slider(current_layer.grass_output.mix[0],0,30);
						    if (GUI.changed)
						    {
						    	gui_changed_old = true;
						    	current_layer.grass_output.set_grass_curve();
						    }
				           	GUI.changed = gui_changed_old;
						    EditorGUILayout.EndHorizontal();
						}
					    
					    if (script.settings.color_scheme){GUI.color = color_grass;}
					}
			        
			        for (count_grass = 0;count_grass < current_layer.grass_output.grass.Count;++count_grass)
		           	{
		           		var current_grass: grass_class = current_layer.grass_output.grass[count_grass];
		           				 
		           		if (script.settings.color_scheme)
		           		{
		           			if (!current_layer.grass_output.grass_value.active[count_grass]){color_grass += Color(-0.3,-0.3,-0.3,0);}
		           			GUI.color = color_grass;
		           		}
		           				 
		           		EditorGUILayout.BeginHorizontal();
		           		GUILayout.Space(space+45); 
		           		if (current_layer.grass_output.grass_terrain_set)
	  				    {				    		
							EditorGUILayout.BeginHorizontal();
							if (script.terrains[current_layer.grass_output.grass_terrain].terrain)
							{
								if (script.terrains[current_layer.grass_output.grass_terrain].prearea.resolution == 0)
								{
									script.get_terrain_settings(script.terrains[current_layer.grass_output.grass_terrain],"(con)");
								}
								
								if (current_grass.prototypeindex > script.terrains[current_layer.grass_output.grass_terrain].terrain.terrainData.detailPrototypes.Length-1)
								{
									current_grass.prototypeindex = script.terrains[current_layer.grass_output.grass_terrain].terrain.terrainData.detailPrototypes.Length-1;
								}
								if (current_grass.prototypeindex < 0)
								{
									current_grass.prototypeindex = 0;
								}
								if (script.terrains[current_layer.grass_output.grass_terrain].terrain.terrainData.detailPrototypes.Length > 0)
								{
									// grass text
									EditorGUILayout.LabelField(count_grass+").",GUILayout.Width(27));
									EditorGUILayout.ObjectField(script.terrains[current_layer.grass_output.grass_terrain].terrain.terrainData.detailPrototypes[current_grass.prototypeindex].prototypeTexture,Texture,true,GUILayout.Height(50),GUILayout.Width(50));
								}
							}
							current_grass.prototypeindex = EditorGUILayout.IntField(current_grass.prototypeindex,GUILayout.Width(25));
							if (GUILayout.Button("+",GUILayout.Width(25)))
							{
								if (!key.shift)
								{
									current_grass.prototypeindex += 1;
								}
								else
								{
									if (count_grass > 0){current_grass.prototypeindex = current_layer.grass_output.grass[count_grass-1].prototypeindex+1;}
									else {current_grass.prototypeindex += 1;}
								}
								if (script.generate_auto){generate_auto();}
							}
							if (GUILayout.Button("-",GUILayout.Width(25)) && current_grass.prototypeindex > 0)
							{
								current_grass.prototypeindex -= 1;
								if (script.generate_auto){generate_auto();}
							}
							EditorGUILayout.EndHorizontal();
						}
								 
						gui_changed_old = GUI.changed;
		           		GUI.changed = false;
						current_layer.grass_output.grass_value.value[count_grass] = EditorGUILayout.Slider(current_layer.grass_output.grass_value.value[count_grass],1,100);
						if (script.settings.tooltip_mode != 0)
						{
							tooltip_text = "Center this value to 50";
						}
						if (GUILayout.Button(GUIContent("C",tooltip_text),GUILayout.Width(25))){current_layer.grass_output.grass_value.value[count_grass] = 50;GUI.changed = true;}
						EditorGUILayout.LabelField(current_layer.grass_output.grass_value.text[count_grass],GUILayout.Width(90));
						if (GUI.changed)
						{
							gui_changed_old = true;
							current_layer.grass_output.grass_value.calc_value();current_layer.grass_output.set_grass_curve();
						}
								 
						if (!script.settings.toggle_text_no)
						{
							if (script.settings.toggle_text_long){EditorGUILayout.LabelField("Active",GUILayout.Width(50));} else {EditorGUILayout.LabelField("Act",GUILayout.Width(28));}
						}
						GUI.changed = false;
						current_layer.grass_output.grass_value.active[count_grass] = EditorGUILayout.Toggle(current_layer.grass_output.grass_value.active[count_grass],GUILayout.Width(25));
						if (GUI.changed)
						{
							gui_changed_old = true;
							current_layer.grass_output.grass_value.calc_value();
							current_layer.grass_output.set_grass_curve();
						}
						GUI.changed = gui_changed_old;
								 
	           			if (script.settings.display_mix_curves){current_layer.grass_output.curves[count_grass].curve = EditorGUILayout.CurveField(current_layer.grass_output.curves[count_grass].curve);}
		           				  
		           		if (GUILayout.Button("<",GUILayout.Width(25)) && count_grass > 0)
		           		{
		           			if (current_layer.grass_output.swap_grass(count_grass,count_grass-1))
		           			{
		           				if (script.generate_auto){generate_auto();}
		           			}
		           		} 		 
		           		if (GUILayout.Button(">",GUILayout.Width(25)) && count_grass < current_layer.grass_output.grass.Count-1)
		           		{
		           			if (current_layer.grass_output.swap_grass(count_grass,count_grass+1))
		           			{
		           				if (script.generate_auto){generate_auto();}
		           			}
		           		}
		           		if (GUILayout.Button("+",GUILayout.Width(25)))
		           		{
		           			add_grass(current_layer.grass_output,count_grass,current_layer.grass_output.grass_terrain,key.shift);
		           			if (script.generate_auto){generate_auto();}
		           		}	 
		           		if (GUILayout.Button("-",GUILayout.Width(25)) && key.control)
		           		{
		           			current_layer.grass_output.erase_grass(count_grass);
		           			if (script.generate_auto){generate_auto();}
		           			this.Repaint();
		        			return;
		           		}
		           		EditorGUILayout.EndHorizontal();
		           		
		           	    GUILayout.Space(1); 
		           		if (script.settings.color_scheme)
		           		{
		           			if (!current_layer.grass_output.grass_value.active[count_grass]){color_grass += Color(0.3,0.3,0.3,0);}
		           			GUI.color = color_grass;
		           		}
		           		if (current_layer.grass_output.mix_mode == mix_mode_enum.Single && count_grass < current_layer.grass_output.grass.Count-1)
				        {
					    	if (script.settings.color_scheme)
					        {
					        	GUI.color = Color.green;
					        }
					        EditorGUILayout.BeginHorizontal();
					        GUILayout.Space(space+95);
					        EditorGUILayout.LabelField("Mix rate",GUILayout.Width(60));
					        gui_changed_old = GUI.changed;
					        GUI.changed = false;
					        current_layer.grass_output.mix[count_grass+1] = EditorGUILayout.Slider(current_layer.grass_output.mix[count_grass+1],0,5);
					        if (GUI.changed)
					        {
					        	gui_changed_old = true;
					        	current_layer.grass_output.set_grass_curve();
			           		}
			           		GUI.changed = gui_changed_old;
					        EditorGUILayout.EndHorizontal();
					        if (script.settings.color_scheme){GUI.color = color_grass;}
					      }
			       	}
		        }	
			}
	        
	        // object layer
		    if (current_layer.output == layer_output_enum.object)
		    {
		    	var color_object: Color = script.settings.color.color_object;
		        if (script.settings.remarks){draw_remarks(current_layer.remarks,space+30);}
		        if (script.settings.color_scheme){GUI.color = color_object;}
		        EditorGUILayout.BeginHorizontal();
	           	GUILayout.Space(space+30);
	           	gui_changed_old = GUI.changed;
	           	current_layer.object_output.foldout = EditorGUILayout.Foldout(current_layer.object_output.foldout,current_layer.object_output.object_text);  
	           	GUI.changed = gui_changed_old;
	           	EditorGUILayout.EndHorizontal();
	           	
				// object_foldout
	       		if (current_layer.object_output.foldout)
	       		{
					EditorGUILayout.BeginHorizontal(); 
			    	GUILayout.Space(space+45);
			        if (GUILayout.Button("+",GUILayout.Width(25))){add_object(current_layer.object_output.object.Count-1,current_layer.object_output);}
		        	if (GUILayout.Button("-",GUILayout.Width(25)) && current_layer.object_output.object.Count > 1 && key.control)
		        	{
		        		if (!key.shift)
		        		{
		        			Undo.RegisterUndo(script,"Ease Object");
				        	erase_object(current_layer.object_output.object.Count-1,current_layer.object_output);
		        		}
				        else
				        {
				           	Undo.RegisterUndo(script,"Ease Objects");
				        	script.clear_object(current_layer.object_output);
				        }
		        		this.Repaint();
		        		return;
		        	} 
		        	if (GUILayout.Button("F",GUILayout.Width(20)))
					{
						current_layer.object_output.objects_foldout = !current_layer.object_output.objects_foldout;
						script.change_objects_foldout(current_layer.object_output,key.shift);
					}
		        	if (GUILayout.Button("A",GUILayout.Width(20)))
					{
						current_layer.object_output.objects_active = !current_layer.object_output.objects_active;
						script.change_objects_active(current_layer.object_output,key.shift);
					}
					if (GUILayout.Button("»I«",GUILayout.Width(35)))
					{
						if (key.alt){current_layer.object_output.search_active = !current_layer.object_output.search_active;}
						else 
						if (key.shift)
						{
							current_layer.object_output.icon_display = !current_layer.object_output.icon_display;
						}
						else
						{
							
							current_layer.object_output.interface_display = !current_layer.object_output.interface_display;
						}
					}
			        EditorGUILayout.EndHorizontal();
			        
			        if (current_layer.object_output.search_active)
			        {
			        	EditorGUILayout.BeginHorizontal();
						GUILayout.Space(space+45);
						EditorGUILayout.LabelField("Parent Object",GUILayout.Width(147));
						current_layer.object_output.search_object = EditorGUILayout.ObjectField(current_layer.object_output.search_object,Transform,true) as Transform;
			        	EditorGUILayout.EndHorizontal();
			        	
			        	EditorGUILayout.BeginHorizontal();
						GUILayout.Space(space+45);
						EditorGUILayout.LabelField("Erase Doubles",GUILayout.Width(147));
						current_layer.object_output.search_erase_doubles = EditorGUILayout.Toggle(current_layer.object_output.search_erase_doubles,GUILayout.Width(25));
						EditorGUILayout.EndHorizontal();
						
			        	EditorGUILayout.BeginHorizontal();
						GUILayout.Space(space+45);
						if (GUILayout.Button("<Search>",GUILayout.Width(70)) && key.shift)
			        	{
			        		script.set_auto_object(current_layer.object_output);
			        	}
			        	if (GUILayout.Button("<Arrange>",GUILayout.Width(80)) && key.shift)
			        	{
			        		script.arrange_objects_scene(current_layer.object_output);
			        	}
			        	EditorGUILayout.EndHorizontal();
			        	
			        	EditorGUILayout.BeginHorizontal();
						GUILayout.Space(space+45);
						
						if (GUILayout.Button("<Clear>",GUILayout.Width(70)) && key.shift)
			        	{
			        		Undo.RegisterUndo(script,"Clear Objects");
			        		current_layer.object_output.object.Clear();
			        	}
			        	EditorGUILayout.EndHorizontal();
			        }
			        
			        EditorGUILayout.BeginHorizontal();
					GUILayout.Space(space+45);
					EditorGUILayout.LabelField("Strength",GUILayout.Width(147));
					current_layer.strength = EditorGUILayout.Slider(current_layer.strength,0,1);
			        EditorGUILayout.EndHorizontal();
			              		      		
			        
			        GUILayout.Space(2);      		      			      		      			
			        EditorGUILayout.BeginHorizontal(); 
			        GUILayout.Space(space+45);
		        	EditorGUILayout.LabelField("Scale",GUILayout.Width(147));
		        	current_layer.object_output.scale = EditorGUILayout.Slider(current_layer.object_output.scale,0,30);
			        EditorGUILayout.EndHorizontal();
			              		
			        for (count_object = 0;count_object < current_layer.object_output.object.Count;++count_object)
		           	{
			        	var current_object: object_class = current_layer.object_output.object[count_object];
			        	
			        	if (!current_layer.object_output.object_value.active[count_object])
			           	{
			           		color_object += Color(-0.2,-0.2,-0.2,0);
			           		GUI.color = color_object;
			           	}
			        	
			           	if (current_object.color_object != color_object)
		           		{
		           			if (current_object.color_object[0] > color_object[0]){current_object.color_object[0] -= 0.003;} 
		           				else if (current_object.color_object[0]+0.01 < color_object[0]){current_object.color_object[0] += 0.003;}
		           					else {current_object.color_object[0] = color_object[0];}
		           			if (current_object.color_object[1] > color_object[1]){current_object.color_object[1] -= 0.003;} 
		           				else if (current_object.color_object[1]+0.01 < color_object[1]){current_object.color_object[1] += 0.003;}
		           					else {current_object.color_object[1] = color_object[1];}
		           			if (current_object.color_object[2] > color_object[2]){current_object.color_object[2] -= 0.003;} 
		           				else if (current_object.color_object[2]+0.01 < color_object[2]){current_object.color_object[2] += 0.003;}
		           					else {current_object.color_object[2] = color_object[2];}
		           			this.Repaint();
		           		}
		           		color_object = current_object.color_object;
			           	if (script.settings.color_scheme){GUI.color = color_object;}			    			    			 			    			    			 
			           	EditorGUILayout.BeginHorizontal();
			           	GUILayout.Space(space+45); 
			           	
			           	if (current_layer.object_output.icon_display)
	        			{
		        			if (!current_object.object1){GUILayout.Button(GUIContent("Empty"),EditorStyles.miniButtonMid,GUILayout.Width(64),GUILayout.Height(64));}
					        else
		        			{
			        			if (AssetDatabase.Contains(current_object.object1))
			        			{
									#if !UNITY_3_4 && !UNITY_3_5
									current_object.preview_texture = AssetPreview.GetAssetPreview(current_object.object1);
									#else
								    current_object.preview_texture = EditorUtility.GetAssetPreview(current_object.object1);
								    #endif
							        		
							    	if (script.settings.tooltip_mode == 2)
									{
										tooltip_text = "Click to preview\n\nClick again to close preview";
									} else {tooltip_text = "";}
							        if (GUILayout.Button(GUIContent(current_object.preview_texture,tooltip_text),EditorStyles.miniButtonMid,GUILayout.Width(64),GUILayout.Height(64))){create_preview_window(current_object.preview_texture,"Object Preview");}
							    }
						  	}	 
						}
						
			           	if (!script.settings.color_scheme){color_object = script.settings.color.color_object;} 
			           	
			           	// object counter
			           	if (script2)
			           	{
				           	if (current_object.placed_reference)
				           	{
				           		current_object.placed = current_object.placed_reference.placed;
				           	}
				       	}
			           		    	 
			    		gui_changed_old = GUI.changed;
			    		current_object.foldout = EditorGUILayout.Foldout(current_object.foldout,"Object"+count_object+" (P "+current_object.placed+") ");
						GUI.changed = gui_changed_old;
						GUI.changed = false;
						GUILayout.Space(50);
						current_layer.object_output.object_value.value[count_object] = EditorGUILayout.Slider(current_layer.object_output.object_value.value[count_object],1,100);
						if (script.settings.tooltip_mode != 0)
						{
							tooltip_text = "Center this value to 50";
						}
						if (GUILayout.Button(GUIContent("C",tooltip_text),GUILayout.Width(25))){current_layer.object_output.object_value.value[count_object] = 50;GUI.changed = true;}
						if (GUI.changed)
						{
							gui_changed_old = true;
							current_layer.object_output.object_value.calc_value();GUI.changed = false;
						}
						EditorGUILayout.LabelField(current_layer.object_output.object_value.text[count_object],GUILayout.Width(90));
						current_object.object1 = EditorGUILayout.ObjectField(current_object.object1,GameObject,true) as GameObject;
						if (GUI.changed)
						{
							gui_changed_old = true;
							if (current_object.object1)
							{
								current_object.name = current_object.object1.name;
								if (!current_object.combine_parent_name_input){current_object.combine_parent_name = current_object.object1.name;}
							}
							current_object.count_mesh();
						}
									 
						if (!script.settings.toggle_text_no)
	        			{
	        				if (script.settings.toggle_text_long){EditorGUILayout.LabelField("Active",GUILayout.Width(50));} else {EditorGUILayout.LabelField("Act",GUILayout.Width(28));}
	        			}
	        			GUI.changed = false;
						current_layer.object_output.object_value.active[count_object] = EditorGUILayout.Toggle(current_layer.object_output.object_value.active[count_object],GUILayout.Width(25));
						if (GUI.changed)
		           		{
		           			gui_changed_old = true;
		           			current_layer.object_output.object_value.calc_value();
		           		}
		           		GUI.changed = gui_changed_old;
		           					 
		           		if (current_layer.object_output.interface_display)
		           		{
				        	if (GUILayout.Button("<",GUILayout.Width(25)) && count_object > 0)
				        	{
				        		current_layer.object_output.swap_object(count_object,count_object-1);
				        		this.Repaint();
				        		return;
				        	} 		 
				        	if (GUILayout.Button(current_object.swap_text,GUILayout.Width(35)))
				           	{
				           		swap_object(current_object,count_object,current_layer.object_output);
				           		this.Repaint();
				           		return;
				            } 		 
				           	if (GUILayout.Button(">",GUILayout.Width(25)) && count_object < current_layer.object_output.object.Count-1)
				           	{
				           		current_layer.object_output.swap_object(count_object,count_object+1);
				           		this.Repaint();
				           		return;
				           	}
				           	if (GUILayout.Button("+",GUILayout.Width(25))){add_object(count_object,current_layer.object_output);}	 
				           	if (GUILayout.Button("-",GUILayout.Width(25)) && key.control)
				           	{
				           		Undo.RegisterUndo(script,"Ease Object");
				           		erase_object(count_object,current_layer.object_output);
				           		this.Repaint();
				           		return;
				           	}
			           	}
			           	EditorGUILayout.EndHorizontal();
			           				 
			           	if (current_object.foldout)
			           	{
			           		EditorGUILayout.BeginHorizontal();
					        GUILayout.Space(space+60);
					        gui_changed_old = GUI.changed;
					        current_object.data_foldout = EditorGUILayout.Foldout(current_object.data_foldout,"Data");
					        GUI.changed = gui_changed_old;
					        EditorGUILayout.EndHorizontal(); 
								 	
							if (current_object.data_foldout)
		    	     		{
			    	     		EditorGUILayout.BeginHorizontal();
				           		GUILayout.Space(space+75);
				           		EditorGUILayout.LabelField("Vertices length",GUILayout.Width(140));
				           		EditorGUILayout.LabelField(""+current_object.mesh_length,GUILayout.Width(140));
				           		EditorGUILayout.EndHorizontal();
				           					
				           		EditorGUILayout.BeginHorizontal();
				           		GUILayout.Space(space+75);
				           		EditorGUILayout.LabelField("Trianlges length",GUILayout.Width(140));
				           		EditorGUILayout.LabelField(""+current_object.mesh_triangles/3,GUILayout.Width(140));
				           		EditorGUILayout.EndHorizontal();
				           				 
				           		EditorGUILayout.BeginHorizontal();
				           		GUILayout.Space(space+75);
				           		EditorGUILayout.LabelField("Combine max",GUILayout.Width(140));
				           		EditorGUILayout.LabelField(""+current_object.mesh_combine,GUILayout.Width(140));
				           		EditorGUILayout.EndHorizontal();
			    	     				 	
			    	     		EditorGUILayout.BeginHorizontal();
				           		GUILayout.Space(space+75);
				           		EditorGUILayout.LabelField("Size",GUILayout.Width(140));
				           		EditorGUILayout.LabelField(""+current_object.mesh_size,GUILayout.Width(170));
				           		EditorGUILayout.EndHorizontal();
				           				 	
				           		EditorGUILayout.BeginHorizontal();
				           		GUILayout.Space(space+75);
				           		EditorGUILayout.LabelField("Size Scale",GUILayout.Width(140));
				           		EditorGUILayout.LabelField(""+current_object.mesh_size*current_layer.object_output.scale,GUILayout.Width(170));
				           		EditorGUILayout.EndHorizontal();
				           		
				           		EditorGUILayout.BeginHorizontal();
				           		GUILayout.Space(space+75);
				           		if (GUILayout.Button("Create Connection Points",GUILayout.Width(170)))
				           		{
				           			current_object.object2 = Instantiate(current_object.object1);
				           			var point1: GameObject = new GameObject();
				           			point1.transform.position = current_object.object2.transform.position;
				           			point1.transform.parent = current_object.object2.transform;
				           			point1.transform.Translate(-current_object.mesh_size.x/2,current_object.mesh_size.y,current_object.mesh_size.z/2);

				           			var point2: GameObject = new GameObject();
				           			point2.transform.position = current_object.object2.transform.position;
				           			point2.transform.parent = current_object.object2.transform;
				           			point2.transform.Translate(current_object.mesh_size.x/2,current_object.mesh_size.y,current_object.mesh_size.z/2);
				           			
				           			var point3: GameObject = new GameObject();
				           			point3.transform.position = current_object.object2.transform.position;
				           			point3.transform.parent = current_object.object2.transform;
				           			point3.transform.Translate(current_object.mesh_size.x/2,current_object.mesh_size.y,-current_object.mesh_size.z/2);
				           			
				         			var point4: GameObject = new GameObject();
				           			point4.transform.position = current_object.object2.transform.position;
				           			point4.transform.parent = current_object.object2.transform;
				           			point4.transform.Translate(-current_object.mesh_size.x/2,current_object.mesh_size.y,-current_object.mesh_size.z/2);				           			
				           		}
				           		EditorGUILayout.EndHorizontal();
					     	}	
			    	     	EditorGUILayout.BeginHorizontal();
					        GUILayout.Space(space+60);
					        gui_changed_old = GUI.changed;
					        current_object.settings_foldout = EditorGUILayout.Foldout(current_object.settings_foldout,"Settings");
					        GUI.changed = gui_changed_old;
					        EditorGUILayout.EndHorizontal();				
					           			 
					        if (current_object.settings_foldout)
					        {
					        	GUILayout.Space(5);
			    	     		EditorGUILayout.BeginHorizontal();
					           	GUILayout.Space(space+75);
					           	EditorGUILayout.LabelField("Parent",GUILayout.Width(140));
					           	gui_changed_old = GUI.changed;
					           	GUI.changed = false;
					           	current_object.parent = EditorGUILayout.ObjectField(current_object.parent,Transform,true) as Transform;
				           		if (GUI.changed)
				           		{
				           			if (current_object.parent){current_object.parent_name = current_object.parent.name;}
				           		}
				           		GUI.changed = gui_changed_old;
				           		EditorGUILayout.EndHorizontal();
				           				 	
				           		EditorGUILayout.BeginHorizontal();
				           		GUILayout.Space(space+75);
				           		EditorGUILayout.LabelField("Clear Parent",GUILayout.Width(140));
				           		current_object.parent_clear = EditorGUILayout.Toggle(current_object.parent_clear,GUILayout.Width(25));
				           		if (GUILayout.Button("<Clear>",EditorStyles.miniButtonMid,GUILayout.Width(70)))
				           		{
				           			if (!script2)
				           			{
				           				if (key.shift){script.clear_parent_object(current_object);}
				           			}
				           			else
				           			{
				           				this.ShowNotification(GUIContent("Can't clear parent when Generating"));
				           			}
				           		}
				           		EditorGUILayout.EndHorizontal();
				           				 	
				           		EditorGUILayout.BeginHorizontal();
					           	GUILayout.Space(space+75);
					           	EditorGUILayout.LabelField("Combine Meshes",GUILayout.Width(140));
					           	current_object.combine = EditorGUILayout.Toggle(current_object.combine,GUILayout.Width(25));
				           		EditorGUILayout.EndHorizontal();
				           					
				           		if (current_object.combine)
				           		{
					           		if (prelayer.index > 0)
					           		{
					           			EditorGUILayout.BeginHorizontal();
							           	GUILayout.Space(space+75);
							           	EditorGUILayout.LabelField("Combine Total",GUILayout.Width(140));
							           	current_object.combine_total = EditorGUILayout.Toggle(current_object.combine_total,GUILayout.Width(25));
						           		EditorGUILayout.EndHorizontal();
						           	}
				           						
				           			EditorGUILayout.BeginHorizontal();
					           		GUILayout.Space(space+75);
					           		EditorGUILayout.LabelField("Combine Name",GUILayout.Width(140));
					           		gui_changed_old = GUI.changed;
					           		GUI.changed = false;
					           		current_object.combine_parent_name = EditorGUILayout.TextField(current_object.combine_parent_name);
					           		if (GUI.changed){current_object.combine_parent_name_input = true;}
					           		GUI.changed = gui_changed_old;
				           			EditorGUILayout.EndHorizontal();	
			           			}
				           		EditorGUILayout.BeginHorizontal();
					           	GUILayout.Space(space+75);
					           	EditorGUILayout.LabelField("Place Max",GUILayout.Width(140));
					           	current_object.place_maximum = EditorGUILayout.Toggle(current_object.place_maximum,GUILayout.Width(25));
				           		EditorGUILayout.EndHorizontal();	 
				           					
				           		if (current_object.place_maximum)
				           		{
					           		EditorGUILayout.BeginHorizontal();
						           	GUILayout.Space(space+75);
						           	EditorGUILayout.LabelField("Place Max",GUILayout.Width(140));
						           	gui_changed_old = GUI.changed;
						           	GUI.changed = false;
						           	current_object.place_max = EditorGUILayout.IntField(current_object.place_max,GUILayout.Width(250));
						           	if (GUI.changed)
						           	{
						           		gui_changed_old = true;
						           		if (current_object.place_max < 0){current_object.place_max = 0;}
						           	}
						           	GUI.changed = gui_changed_old;
						           	EditorGUILayout.EndHorizontal();
						           				 
						           	if (prelayer.index > 0)
						           	{
							        	EditorGUILayout.BeginHorizontal();
							           	GUILayout.Space(space+75);
							           	EditorGUILayout.LabelField("Place Total",GUILayout.Width(140));
							           	current_object.place_maximum_total = EditorGUILayout.Toggle(current_object.place_maximum_total,GUILayout.Width(25));
						           		EditorGUILayout.EndHorizontal();	
						           	}
						        }
						        if (script.settings.tooltip_mode != 0)
				           			{
				           				tooltip_text = "Set these Settings Parameters to all active Objects in this Layer (Click)\n\nSet these Settings Parameters to all Objects in this Layer (Shift Click)";
				           			}
				           			EditorGUILayout.BeginHorizontal();
					           		GUILayout.Space(space+75);
					           			
				           			if (current_layer.object_output.object.Count > 1)
				           			{
					           			if (GUILayout.Button(GUIContent(">Set All",tooltip_text),GUILayout.Width(65)))
					           			{
					           				Undo.RegisterUndo(script,"Set All Settings Objects");
					           				if (script.generate_auto){generate_auto();}
					           				current_layer.object_output.set_settings(current_object,count_object,key.shift);	
					           			}
					           		}
				           			
						        if (script.settings.color_scheme){GUI.color = script.settings.color.color_layer;}
							    if (current_object.prelayer_created)
						       	{
							       	if (GUILayout.Button("-Erase Layer Level-",GUILayout.Width(140)) && key.control)
									{
										Undo.RegisterUndo(script,"Erase Layer Level");
					   					script.erase_prelayer(current_object.prelayer_index);
										current_object.prelayer_created = false;
										script.count_layers();
										this.Repaint();
						       			return;
									}
								}
								else
								{
									
									if(GUILayout.Button("Create Layer Level",GUILayout.Width(140)))
									{
										current_object.prelayer_created = true;
										current_object.prelayer_index = script.prelayers.Count;
										script.add_prelayer(true);
										script.prelayers[script.prelayers.Count-1].prearea.area_max = script.settings.area_max;
										script.prelayers[script.prelayers.Count-1].prearea.max();
										script.set_area_resolution(script.terrains[0],script.prelayers[script.prelayers.Count-1].prearea);
									}
								}
								EditorGUILayout.EndHorizontal();
								if (script.settings.color_scheme){GUI.color = Color.white;}
					        }
				           				
			    	     	EditorGUILayout.BeginHorizontal();
			    	     	GUILayout.Space(space+60);
			    	     	gui_changed_old = GUI.changed;
			    	     	current_object.object_material.foldout = EditorGUILayout.Foldout(current_object.object_material.foldout,"Materials");
			    	     	GUI.changed = gui_changed_old;
			    	     	EditorGUILayout.EndHorizontal();
		    	     				 	
		    	     		if (current_object.object_material.foldout)
		    	     		{
		    	     			EditorGUILayout.BeginHorizontal();
			    	     		GUILayout.Space(space+75);
			    	     		if (GUILayout.Button("+",GUILayout.Width(25))){current_object.object_material.add_material(current_object.object_material.material.Count);}	 
			           			if (GUILayout.Button("-",GUILayout.Width(25)) && key.control && current_object.object_material.material.Count > 1)
			           			{
			           				Undo.RegisterUndo(script,"Erase Material");
			           				current_object.object_material.erase_material(current_object.object_material.material.Count-1);
			           			    this.Repaint();
		        					return;
			           			}
		    	     			EditorGUILayout.EndHorizontal();
				    	     				
				    	     	EditorGUILayout.BeginHorizontal();
			    	     		GUILayout.Space(space+75);
			    	     		EditorGUILayout.LabelField("Active",GUILayout.Width(100));
			    	     		current_object.object_material.active = EditorGUILayout.Toggle(current_object.object_material.active,GUILayout.Width(25));
			    	     		EditorGUILayout.EndHorizontal();
				    	     				
		    	     			for (var count_material: int = 0;count_material < current_object.object_material.material.Count;++count_material)
		    	     			{
		    	     				EditorGUILayout.BeginHorizontal();
				    	     		GUILayout.Space(space+75);
				    	     		EditorGUILayout.LabelField(""+count_material+":",GUILayout.Width(20));
				    	     		current_object.object_material.material[count_material] = EditorGUILayout.ObjectField(current_object.object_material.material[count_material],Material,false);
				    	     		if (GUILayout.Button("+",GUILayout.Width(25))){current_object.object_material.add_material(count_material+1);}	 
				    	     		if (GUILayout.Button("-",GUILayout.Width(25)) && key.control && current_object.object_material.material.Count > 1)
				           			{
				           				Undo.RegisterUndo(script,"Erase Material");
				           				current_object.object_material.erase_material(count_material);
				           			    this.Repaint();
			        					return;
				           			}
				    	     		EditorGUILayout.EndHorizontal();
				    	     					
				    	     		if (current_object.object_material.material[count_material])
		    	     				{	
				    	     			EditorGUILayout.BeginHorizontal();
				    	     			GUILayout.Space(space+99);
				    	     			var main_color: Color = current_object.object_material.material[count_material].GetColor("_Color");
			    	     				main_color = EditorGUILayout.ColorField(main_color);
			    	     				current_object.object_material.material[count_material].SetColor("_Color",main_color);
			    	     				EditorGUILayout.EndHorizontal();
			    	     				 			
			    	     				gui_changed_old = GUI.changed;
						           		GUI.changed = false;
										EditorGUILayout.BeginHorizontal();
				    	     			GUILayout.Space(space+99);
										current_object.object_material.material_value.value[count_material] = EditorGUILayout.Slider(current_object.object_material.material_value.value[count_material],1,100);
										if (GUI.changed)
										{
											gui_changed_old = true;
											current_object.object_material.material_value.calc_value();
										}
										GUI.changed = gui_changed_old;
										EditorGUILayout.EndHorizontal();
							    	 }
		    	     			}
		    	     		}
		    	     		EditorGUILayout.BeginHorizontal();
				           	GUILayout.Space(space+60);
				           	gui_changed_old = GUI.changed;
		    	     		current_object.transform_foldout = EditorGUILayout.Foldout(current_object.transform_foldout,"Transform");
		    	     		GUI.changed = gui_changed_old;
		    	     		EditorGUILayout.EndHorizontal();
		    	     				 	
		    	     		if (current_object.transform_foldout)
		    	     		{
			    	     		EditorGUILayout.BeginHorizontal();
				           		GUILayout.Space(space+75);
				           		EditorGUILayout.LabelField("Scale    ",GUILayout.Width(55));
				           		if (GUILayout.Button("L",GUILayout.Width(20)))
				           		{
				           			current_object.scale_link = !current_object.scale_link;
				           			if (current_object.scale_link)
				           			{
				           				current_object.scale_link_start_y = current_object.scale_link_end_y = current_object.scale_link_start_z = current_object.scale_link_end_z = true;
				           			} 
				           			else
				           			{
				           				current_object.scale_link_start_y = current_object.scale_link_end_y = current_object.scale_link_start_z = current_object.scale_link_end_z = false;
				           			}
				           		}
				           		GUILayout.Space(5);
				           				
				           		// scale
				           		if (GUILayout.Button("X",GUILayout.Width(20))){current_object.scale_start.x = 1;current_object.scale_end.x = 1;}
				           		current_object.scale_start.x = EditorGUILayout.FloatField(Mathf.Round(current_object.scale_start.x*100)/100,GUILayout.Width(40));
				           		if (current_object.scale_start.x > current_object.scale_end.x){current_object.scale_end.x = current_object.scale_start.x;}
				           		EditorGUILayout.MinMaxSlider(current_object.scale_start.x,current_object.scale_end.x,0,10);
				           		current_object.scale_end.x = EditorGUILayout.FloatField(Mathf.Round(current_object.scale_end.x*100)/100,GUILayout.Width(40));
				           		GUILayout.Space(29);
				           		EditorGUILayout.EndHorizontal();
	
				           		EditorGUILayout.BeginHorizontal();
				           		GUILayout.Space(space+134);
				           		current_object.scale_link_start_y = EditorGUILayout.Toggle(current_object.scale_link_start_y,GUILayout.Width(25));
				           		if (current_object.scale_link_start_y){current_object.scale_start.y = current_object.scale_start.x;}
				           		if (GUILayout.Button("Y",GUILayout.Width(20))){current_object.scale_start.y = 1;current_object.scale_end.y = 1;}
				           		current_object.scale_start.y = EditorGUILayout.FloatField(Mathf.Round(current_object.scale_start.y*100)/100,GUILayout.Width(40));
				           		if (current_object.scale_start.y > current_object.scale_end.y){current_object.scale_end.y = current_object.scale_start.y;}
				           		EditorGUILayout.MinMaxSlider(current_object.scale_start.y,current_object.scale_end.y,0,10);
				           		current_object.scale_end.y = EditorGUILayout.FloatField(Mathf.Round(current_object.scale_end.y*100)/100,GUILayout.Width(40));
				           		current_object.scale_link_end_y = EditorGUILayout.Toggle(current_object.scale_link_end_y,GUILayout.Width(25));
				           		if (current_object.scale_link_end_y){current_object.scale_end.y = current_object.scale_end.x;}
				           		EditorGUILayout.EndHorizontal();
				           				
				  			    EditorGUILayout.BeginHorizontal();
				           		GUILayout.Space(space+134);
				           		current_object.scale_link_start_z = EditorGUILayout.Toggle(current_object.scale_link_start_z,GUILayout.Width(25));
				           		if (current_object.scale_link_start_z){current_object.scale_start.z = current_object.scale_start.x;}
				           		if (GUILayout.Button("Z",GUILayout.Width(20))){current_object.scale_start.z = 1;current_object.scale_end.z = 1;}
				           		current_object.scale_start.z = EditorGUILayout.FloatField(Mathf.Round(current_object.scale_start.z*100)/100,GUILayout.Width(40));
				           		if (current_object.scale_start.z > current_object.scale_end.z){current_object.scale_end.z = current_object.scale_start.z;}
				           		EditorGUILayout.MinMaxSlider(current_object.scale_start.z,current_object.scale_end.z,0,10);
				           		current_object.scale_end.z = EditorGUILayout.FloatField(Mathf.Round(current_object.scale_end.z*100)/100,GUILayout.Width(40));
				           		current_object.scale_link_end_z = EditorGUILayout.Toggle(current_object.scale_link_end_z,GUILayout.Width(25));
				           		if (current_object.scale_link_end_z){current_object.scale_end.z = current_object.scale_end.x;}
				           		EditorGUILayout.EndHorizontal();
	         				 	
	         				    // unlink
	         				    EditorGUILayout.BeginHorizontal();
				           		GUILayout.Space(space+132);
				           		EditorGUILayout.LabelField("Unlink Y",GUILayout.Width(95));
				           		current_object.unlink_y = EditorGUILayout.Slider(current_object.unlink_y,0,2);
				           		GUILayout.Space(29);
				           		EditorGUILayout.EndHorizontal();
				           		
				           		EditorGUILayout.BeginHorizontal();
				           		GUILayout.Space(space+132);
				           		EditorGUILayout.LabelField("Unlink Z",GUILayout.Width(95));
				           		current_object.unlink_z = EditorGUILayout.Slider(current_object.unlink_z,0,2);
				           		GUILayout.Space(29);
				           		EditorGUILayout.EndHorizontal();
									         				    	         				 				 			 			 
	         				 	// rotation
	         				 	GUILayout.Space(4);
				           		EditorGUILayout.BeginHorizontal();
				           		GUILayout.Space(space+75); 
				           		EditorGUILayout.LabelField("Rotation",GUILayout.Width(55)); 
				           		if (GUILayout.Button("L",GUILayout.Width(20)))
				           		{
				           			current_object.rotation_link = !current_object.rotation_link;
				           			if (current_object.rotation_link)
				           			{
				           				current_object.rotation_link_start_y = current_object.rotation_link_end_y = current_object.rotation_link_start_z = current_object.rotation_link_end_z = true;
				           			} 
				           			else
				           			{
				           				current_object.rotation_link_start_y = current_object.rotation_link_end_y = current_object.rotation_link_start_z = current_object.rotation_link_end_z = false;
				           			}
				           		}
			 	          		GUILayout.Space(5);
				           		if (GUILayout.Button("X",GUILayout.Width(20))){current_object.rotation_start.x = 0;current_object.rotation_end.x = 0;}
				           		current_object.rotation_start.x = EditorGUILayout.FloatField(Mathf.Round(current_object.rotation_start.x*100)/100,GUILayout.Width(40));
				           		if (current_object.rotation_start.x > current_object.rotation_end.x){current_object.rotation_end.x = current_object.rotation_start.x;}
				           		EditorGUILayout.MinMaxSlider(current_object.rotation_start.x,current_object.rotation_end.x,-180,180);
				           		current_object.rotation_end.x = EditorGUILayout.FloatField(Mathf.Round(current_object.rotation_end.x*100)/100,GUILayout.Width(40));
				           		EditorGUILayout.LabelField("",GUILayout.Width(25));
				           		EditorGUILayout.EndHorizontal();
	
	           				 	EditorGUILayout.BeginHorizontal();
				           		GUILayout.Space(space+75);
				           		EditorGUILayout.LabelField("",GUILayout.Width(55));
				           		current_object.rotation_link_start_y = EditorGUILayout.Toggle(current_object.rotation_link_start_y,GUILayout.Width(25));
				           		if (current_object.rotation_link_start_y){current_object.rotation_start.y = current_object.rotation_start.x;}
				           		if (GUILayout.Button("Y",GUILayout.Width(20))){current_object.rotation_start.y = 0;current_object.rotation_end.y = 0;}
				           		current_object.rotation_start.y = EditorGUILayout.FloatField(Mathf.Round(current_object.rotation_start.y*100)/100,GUILayout.Width(40));
				           		if (current_object.rotation_start.y > current_object.rotation_end.y){current_object.rotation_end.y = current_object.rotation_start.y;}
				           		EditorGUILayout.MinMaxSlider(current_object.rotation_start.y,current_object.rotation_end.y,-180,180);
				           		current_object.rotation_end.y = EditorGUILayout.FloatField(Mathf.Round(current_object.rotation_end.y*100)/100,GUILayout.Width(40));
				           		current_object.rotation_link_end_y = EditorGUILayout.Toggle(current_object.rotation_link_end_y,GUILayout.Width(25));
				           		if (current_object.rotation_link_end_y){current_object.rotation_end.y = current_object.rotation_end.x;}
				           		EditorGUILayout.EndHorizontal();
				           				
				  			    EditorGUILayout.BeginHorizontal();
				           		GUILayout.Space(space+75);
				           		EditorGUILayout.LabelField("",GUILayout.Width(55));
				           		current_object.rotation_link_start_z = EditorGUILayout.Toggle(current_object.rotation_link_start_z,GUILayout.Width(25));
				           		if (current_object.rotation_link_start_z){current_object.rotation_start.z = current_object.rotation_start.x;}
				           		if (GUILayout.Button("Z",GUILayout.Width(20))){current_object.rotation_start.z = 0;current_object.rotation_end.z = 0;}
				           		current_object.rotation_start.z = EditorGUILayout.FloatField(Mathf.Round(current_object.rotation_start.z*100)/100,GUILayout.Width(40));
				           		if (current_object.rotation_start.z > current_object.rotation_end.z){current_object.rotation_end.z = current_object.rotation_start.z;}
				           		EditorGUILayout.MinMaxSlider(current_object.rotation_start.z,current_object.rotation_end.z,-180,180);
				           		current_object.rotation_end.z = EditorGUILayout.FloatField(Mathf.Round(current_object.rotation_end.z*100)/100,GUILayout.Width(40));
				           		current_object.rotation_link_end_z = EditorGUILayout.Toggle(current_object.rotation_link_end_z,GUILayout.Width(25));
				           		if (current_object.rotation_link_end_z){current_object.rotation_end.z = current_object.rotation_end.x;}
				           		EditorGUILayout.EndHorizontal();
				           				 	
				           		// position
	  			           		GUILayout.Space(4);
				           		EditorGUILayout.BeginHorizontal();
					           	GUILayout.Space(space+75);
					           	EditorGUILayout.LabelField("Position",GUILayout.Width(55));
					           	GUILayout.Space(29);
					           	if (GUILayout.Button("X",GUILayout.Width(20))){current_object.position_start.x = 0;current_object.position_end.x = 0;}
					           	current_object.position_start.x = EditorGUILayout.FloatField(current_object.position_start.x,GUILayout.Width(40));
					           	EditorGUILayout.MinMaxSlider(current_object.position_start.x,current_object.position_end.x,-1000,1000);
					           	current_object.position_end.x = EditorGUILayout.FloatField(current_object.position_end.x,GUILayout.Width(40));
					           	if (current_object.position_start.x > current_object.position_end.x){current_object.position_end.x = current_object.position_start.x;}
					           	GUILayout.Space(space+10);
					           	EditorGUILayout.EndHorizontal();		           				 	
					           			
					           	EditorGUILayout.BeginHorizontal();
				           		GUILayout.Space(space+79);
				           		EditorGUILayout.LabelField("",GUILayout.Width(80)); 		
					           	if (GUILayout.Button("Y",GUILayout.Width(20))){current_object.position_start.y = 0;current_object.position_end.y = 0;}
					           	current_object.position_start.y = EditorGUILayout.FloatField(current_object.position_start.y,GUILayout.Width(40));
					           	EditorGUILayout.MinMaxSlider(current_object.position_start.y,current_object.position_end.y,-1000,1000);
					           	current_object.position_end.y = EditorGUILayout.FloatField(current_object.position_end.y,GUILayout.Width(40));
					           	if (current_object.position_start.y > current_object.position_end.y){current_object.position_end.y = current_object.position_start.y;}
					           	GUILayout.Space(space+10);
					           	EditorGUILayout.EndHorizontal();	 		 		
					           					 		 		
					           	EditorGUILayout.BeginHorizontal();
				           		GUILayout.Space(space+79);
				           		EditorGUILayout.LabelField("",GUILayout.Width(80)); 		
					           	if (GUILayout.Button("Z",GUILayout.Width(20))){current_object.position_start.z = 0;current_object.position_end.z = 0;}
					           	current_object.position_start.z = EditorGUILayout.FloatField(current_object.position_start.z,GUILayout.Width(40));
					           	EditorGUILayout.MinMaxSlider(current_object.position_start.z,current_object.position_end.z,-1000,1000);
					           	current_object.position_end.z = EditorGUILayout.FloatField(current_object.position_end.z,GUILayout.Width(40));
					           	if (current_object.position_start.z > current_object.position_end.z){current_object.position_end.z = current_object.position_start.z;}
					           	GUILayout.Space(space+10);
					           	EditorGUILayout.EndHorizontal();
					           	
					           	EditorGUILayout.BeginHorizontal();
				           		GUILayout.Space(space+75);
				           		EditorGUILayout.LabelField("Random Position",GUILayout.Width(150));
				           		current_object.random_position = EditorGUILayout.Toggle(current_object.random_position,GUILayout.Width(25));
				           	   	EditorGUILayout.EndHorizontal();	
					           					
					           	EditorGUILayout.BeginHorizontal();
					           	GUILayout.Space(space+75);
					           	EditorGUILayout.LabelField("Include Terrain Height",GUILayout.Width(150));
					           	current_object.terrain_height = EditorGUILayout.Toggle(current_object.terrain_height,GUILayout.Width(25));
					           	EditorGUILayout.EndHorizontal();	
					           				
					           	EditorGUILayout.BeginHorizontal();
					           	GUILayout.Space(space+75);
					           	EditorGUILayout.LabelField("Include Terrain Rotation",GUILayout.Width(150));
					           	current_object.terrain_rotate = EditorGUILayout.Toggle(current_object.terrain_rotate,GUILayout.Width(25));
					           	EditorGUILayout.EndHorizontal();	
					           				
					           	if (script.settings.tooltip_mode != 0)
						        {
						        	tooltip_text = "Set these Transform Parameters to all active Objects in this Layer (Click)\n\nSet these Transform Parameters to all Objects in this Layer (Shift Click)";
						        }
						        if (current_layer.object_output.object.Count > 1)
						        {
							    	EditorGUILayout.BeginHorizontal();
							        GUILayout.Space(space+75);
							        if (GUILayout.Button(GUIContent(">Set All",tooltip_text),GUILayout.Width(65)))
							        {
							        	Undo.RegisterUndo(script,"Set All Transforms Objects");
							        	if (script.generate_auto){generate_auto();}
							           	current_layer.object_output.set_transform(current_object,count_object,key.shift);	
							        }
							        EditorGUILayout.EndHorizontal();
							    }
							}
							
				           	EditorGUILayout.BeginHorizontal();
					        GUILayout.Space(space+60);
					        gui_changed_old = GUI.changed;
					        current_object.rotation_foldout = EditorGUILayout.Foldout(current_object.rotation_foldout,"Rotation");
					        GUI.changed = gui_changed_old;
					        EditorGUILayout.EndHorizontal();	
					           				
				           	if (current_object.rotation_foldout)
				           	{
					        	EditorGUILayout.BeginHorizontal();
					           	GUILayout.Space(space+75);
					           	gui_changed_old = GUI.changed;
					           	current_object.rotation_map_foldout = EditorGUILayout.Foldout(current_object.rotation_map_foldout,"Rotation Map");
					           	GUI.changed = gui_changed_old;
					           	EditorGUILayout.EndHorizontal();	
					           				
				           				
					           	if (current_object.rotation_map_foldout)
					           	{
					           		EditorGUILayout.BeginHorizontal();
					           		GUILayout.Space(space+90);
					           		EditorGUILayout.LabelField("Active",GUILayout.Width(115));
					           		current_object.rotation_map.active = EditorGUILayout.Toggle(current_object.rotation_map.active,GUILayout.Width(25));
					           		EditorGUILayout.EndHorizontal();	
					           				
					           		draw_image(current_object.rotation_map.preimage,space-120,color_object,false,5);
					           	}
					           			
					           	EditorGUILayout.BeginHorizontal();
					           	GUILayout.Space(space+75);
					           	EditorGUILayout.LabelField("Rotation Steps",GUILayout.Width(140));
					           	current_object.rotation_steps = EditorGUILayout.Toggle(current_object.rotation_steps,GUILayout.Width(25));
					           	EditorGUILayout.EndHorizontal();	
					           				
					           	if (current_object.rotation_steps)
					           	{
						        	EditorGUILayout.BeginHorizontal();
					           		GUILayout.Space(space+75);
					           		EditorGUILayout.LabelField("Rotation Step X",GUILayout.Width(140));
					           		current_object.rotation_step.x = EditorGUILayout.FloatField(current_object.rotation_step.x);
					           		EditorGUILayout.EndHorizontal();
					           				 	
					           		EditorGUILayout.BeginHorizontal();
					           		GUILayout.Space(space+75);
					           		EditorGUILayout.LabelField("Rotation Step Y",GUILayout.Width(140));
					           		current_object.rotation_step.y = EditorGUILayout.FloatField(current_object.rotation_step.y);
					           		EditorGUILayout.EndHorizontal();
					           				 	
					           		EditorGUILayout.BeginHorizontal();
					           		GUILayout.Space(space+75);
					           		EditorGUILayout.LabelField("Rotation Step Z",GUILayout.Width(140));
					           		current_object.rotation_step.z = EditorGUILayout.FloatField(current_object.rotation_step.z);
					           		EditorGUILayout.EndHorizontal();
					           	} 	
					           				
					           	EditorGUILayout.BeginHorizontal();
					           	GUILayout.Space(space+75);
					           	EditorGUILayout.LabelField("Look at Parent",GUILayout.Width(140));
					           	current_object.look_at_parent = EditorGUILayout.Toggle(current_object.look_at_parent,GUILayout.Width(25));
					           	EditorGUILayout.EndHorizontal();
					           				
					           	if (script.settings.tooltip_mode != 0)
						        {
						        	tooltip_text = "Set these Rotation Parameters to all active Objects in this Layer (Click)\n\nSet these Rotation Parameters to all Objects in this Layer (Shift Click)";
						  		}
						  		if (current_layer.object_output.object.Count > 1)
						    	{
							    	EditorGUILayout.BeginHorizontal();
							        GUILayout.Space(space+75);
							        if (GUILayout.Button(GUIContent(">Set All",tooltip_text),GUILayout.Width(65)))
							        {
							        	Undo.RegisterUndo(script,"Set All Rotation Objects");
							        	if (script.generate_auto){generate_auto();}
							           	current_layer.object_output.set_rotation(current_object,count_object,key.shift);	
							        }
							        EditorGUILayout.EndHorizontal();
							    }
							}	 		 		 		 		 		
				           				
				           	EditorGUILayout.BeginHorizontal();
				           	GUILayout.Space(space+60);
				           	gui_changed_old = GUI.changed;
				           	current_object.distance_foldout = EditorGUILayout.Foldout(current_object.distance_foldout,"Distance");
				           	GUI.changed = gui_changed_old;
				           	EditorGUILayout.EndHorizontal();
				           				
				           	if (current_object.distance_foldout)
				           	{ 
					        	EditorGUILayout.BeginHorizontal();
					           	GUILayout.Space(space+75);
					           	EditorGUILayout.LabelField("Distance Level",GUILayout.Width(140));
					           	current_object.distance_level = EditorGUILayout.EnumPopup(current_object.distance_level,GUILayout.Width(250));
					           	EditorGUILayout.EndHorizontal();
					           	
					        	if (current_object.distance_mode == distance_mode_enum.Square)
								{
									EditorGUILayout.BeginHorizontal();
						           	GUILayout.Space(space+75);
						           	EditorGUILayout.LabelField("Distance Rotation",GUILayout.Width(140));
						           	current_object.distance_rotation_mode = EditorGUILayout.EnumPopup(current_object.distance_rotation_mode,GUILayout.Width(250));
						           	EditorGUILayout.EndHorizontal();
												
									EditorGUILayout.BeginHorizontal();
						           	GUILayout.Space(space+75);
						           	EditorGUILayout.LabelField("Min. Distance X",GUILayout.Width(140));
						           	current_object.min_distance.x = EditorGUILayout.Slider(current_object.min_distance.x,0,2048,GUILayout.Width(250));
						           	EditorGUILayout.EndHorizontal();
						           				
						           	EditorGUILayout.BeginHorizontal();
						           	GUILayout.Space(space+75);
						           	EditorGUILayout.LabelField("Min. Distance Z",GUILayout.Width(140));
						           	current_object.min_distance.z = EditorGUILayout.Slider(current_object.min_distance.z,0,2048,GUILayout.Width(250));
						           	EditorGUILayout.EndHorizontal();
						        }
						        else
						        {
						        	EditorGUILayout.BeginHorizontal();
						           	GUILayout.Space(space+75);
						           	EditorGUILayout.LabelField("Min. Distance",GUILayout.Width(140));
						           	current_object.min_distance.x = EditorGUILayout.Slider(current_object.min_distance.x,0,2048,GUILayout.Width(250));
						           	EditorGUILayout.EndHorizontal();
						        }
						           			
						        EditorGUILayout.BeginHorizontal();
						        GUILayout.Space(space+75);
						        EditorGUILayout.LabelField("Include Scale",GUILayout.Width(140));
						        current_object.distance_include_scale = EditorGUILayout.Toggle(current_object.distance_include_scale,GUILayout.Width(25));
						        EditorGUILayout.EndHorizontal();
						           			
						        EditorGUILayout.BeginHorizontal();
						        GUILayout.Space(space+75);
						        EditorGUILayout.LabelField("Include Scale Group",GUILayout.Width(140));
						        current_object.distance_include_scale_group = EditorGUILayout.Toggle(current_object.distance_include_scale_group,GUILayout.Width(25));
						        EditorGUILayout.EndHorizontal();
						           			
						        if (script.settings.tooltip_mode != 0)
						        {
						        	tooltip_text = "Set these Distance Parameters to all active Objects in this Layer (Click)\n\nSet these Distance Parameters to all Objects in this Layer (Shift Click)";
						        }
						        if (current_layer.object_output.object.Count > 1)
						        {
							    	EditorGUILayout.BeginHorizontal();
							        GUILayout.Space(space+75);
							        if (GUILayout.Button(GUIContent(">Set All",tooltip_text),GUILayout.Width(65)))
							        {
							        	Undo.RegisterUndo(script,"Set All Distance Objects");
							        	if (script.generate_auto){generate_auto();}
							           	current_layer.object_output.set_distance(current_object,count_object,key.shift);	
							        }
							        EditorGUILayout.EndHorizontal();
							    }
							}
			           			
							if (current_object.prelayer_created)
							{
								if (script.settings.color_scheme){GUI.color = script.settings.color.color_layer;}
								EditorGUILayout.BeginHorizontal();
								GUILayout.Space(space+60);
											
								EditorGUILayout.EndHorizontal();
								draw_prelayer(script.prelayers[current_object.prelayer_index],space+60,String.Empty,0);
								current_layer = prelayer.layer[layer_number];
							}
						}			
						
						color_object = script.settings.color.color_object;
		           		if (!current_layer.object_output.object_value.active[count_object])
						{
							GUI.color = color_object;
						}
					}GUILayout.Space(5);
				}GUILayout.Space(1); 
			}
							
			// line placement
			if (current_layer.object_output.object_mode == object_mode_enum.LinePlacement)
			{
				EditorGUILayout.BeginHorizontal();
				GUILayout.Space(space+30);
				gui_changed_old = GUI.changed;
				current_layer.object_output.line_placement.foldout = EditorGUILayout.Foldout(current_layer.object_output.line_placement.foldout,"Line Placement");
				GUI.changed = gui_changed_old;
				EditorGUILayout.EndHorizontal();
							
				if (current_layer.object_output.line_placement.foldout)
				{
					draw_image(current_layer.object_output.line_placement.preimage,space-165,color_object,false,4);	
							
					EditorGUILayout.BeginHorizontal();
					GUILayout.Space(space+45);
					gui_changed_old = GUI.changed;
					current_layer.object_output.line_placement.line_list_foldout = EditorGUILayout.Foldout(current_layer.object_output.line_placement.line_list_foldout,"Line Point List");
					GUI.changed = gui_changed_old;
					EditorGUILayout.EndHorizontal();
								
					if (current_layer.object_output.line_placement.line_list_foldout)
					{
						EditorGUILayout.BeginHorizontal();
						GUILayout.Space(space+60);
						if (GUILayout.Button("+",GUILayout.Width(25)))
						{
							script.add_line_point(current_layer.object_output.line_placement.line_list,current_layer.object_output.line_placement.line_list.Count);
						}
						if (GUILayout.Button("-",GUILayout.Width(25)) && key.control)
						{
							script.erase_line_point(current_layer.object_output.line_placement.line_list,current_layer.object_output.line_placement.line_list.Count-1);
						}
						EditorGUILayout.EndHorizontal();
									
						for (var count_line_list: int = 0;count_line_list < current_layer.object_output.line_placement.line_list.Count;++count_line_list)
						{
							EditorGUILayout.BeginHorizontal();
							GUILayout.Space(space+60);
							gui_changed_old = GUI.changed;
							current_layer.object_output.line_placement.line_list[count_line_list].foldout = EditorGUILayout.Foldout(current_layer.object_output.line_placement.line_list[count_line_list].foldout,"Line Groups"+count_line_list);
							GUI.changed = gui_changed_old;
							EditorGUILayout.EndHorizontal();
										
							if (current_layer.object_output.line_placement.line_list[count_line_list].foldout)
							{
								EditorGUILayout.BeginHorizontal();
								GUILayout.Space(space+75);
								EditorGUILayout.LabelField("Color",GUILayout.Width(100));
								current_layer.object_output.line_placement.line_list[count_line_list].color = EditorGUILayout.ColorField(current_layer.object_output.line_placement.line_list[count_line_list].color);
								EditorGUILayout.EndHorizontal();
										
								EditorGUILayout.BeginHorizontal();
								GUILayout.Space(space+75);
								EditorGUILayout.LabelField("Point length",GUILayout.Width(100));
								current_layer.object_output.line_placement.line_list[count_line_list].point_length = EditorGUILayout.IntField(current_layer.object_output.line_placement.line_list[count_line_list].point_length);
								EditorGUILayout.EndHorizontal();
											
								EditorGUILayout.BeginHorizontal();
								GUILayout.Space(space+75);
								gui_changed_old = GUI.changed;
								current_layer.object_output.line_placement.line_list[count_line_list].point_foldout = EditorGUILayout.Foldout(current_layer.object_output.line_placement.line_list[count_line_list].point_foldout,"Points");
								GUI.changed = gui_changed_old;
								EditorGUILayout.EndHorizontal();
											
								if (current_layer.object_output.line_placement.line_list[count_line_list].point_foldout)
								{
									EditorGUILayout.BeginHorizontal();
									GUILayout.Space(space+90);
									if (GUILayout.Button("Clear",GUILayout.Width(60)))
									{
										current_layer.object_output.line_placement.line_list[count_line_list].points.Clear();	
									}
									if (GUILayout.Button("Wall",GUILayout.Width(60)))
									{
										script.create_object_line(current_layer.object_output);
									}
												
									EditorGUILayout.EndHorizontal();
												
									if (current_layer.object_output.line_placement.line_list[count_line_list].points.Count == 0)
									{
										EditorGUILayout.BeginHorizontal();
										GUILayout.Space(space+90);
										EditorGUILayout.LabelField("Empty",GUILayout.Width(100));
										EditorGUILayout.EndHorizontal();
									}
									else
									{
										for (var count_point: int = 0;count_point < current_layer.object_output.line_placement.line_list[count_line_list].points.Count;++count_point)
										{
											EditorGUILayout.BeginHorizontal();
											GUILayout.Space(space+90);
											EditorGUILayout.LabelField("Point"+count_point+"  "+current_layer.object_output.line_placement.line_list[count_line_list].points[count_point],GUILayout.Width(200));	
											EditorGUILayout.EndHorizontal();
										}
									}
								}
							}
						}
					}
				}
			}
			
			switch (current_layer.output)
			{	
				case layer_output_enum.heightmap:
					filter_text2 = "Height Select";
					subfilter_text2 = "Height Select";
					break;
				case layer_output_enum.color:
					filter_text2 = "Color Select";
					subfilter_text2 = "Color Alpha";
					break;
				case layer_output_enum.splat:
					filter_text2 = "Splat Select";
					subfilter_text2 = "Splat Alpha";
					break;
				case layer_output_enum.tree:
					filter_text2 = "Tree Select";
					subfilter_text2 = "Tree Density";
					break;
				case layer_output_enum.grass:
					filter_text2 = "Grass Select";
					subfilter_text2 = "Grass Density";
					break;
				case layer_output_enum.object:
					filter_text2 = "Object Select";
					subfilter_text2 = "Object Density";
					break;
			}
			
			if (script.settings.filter_select_text)
			{
				filter_text = filter_text2;
				subfilter_text = subfilter_text2;
			}
			else
			{
				filter_text = "Filter";
				subfilter_text = "Subfilter";
			}
			draw_filter(prelayer,current_layer.prefilter,script.filter,space,script.settings.color.color_filter,script.settings.color.color_subfilter,0,count_layer);
		}
	}	
	if (script.settings.box_scheme && prelayer.foldout){GUILayout.Space(5);GUILayout.EndVertical();}
}
 	
	function draw_filter(prelayer: prelayer_class,prefilter: prefilter_class,filter: List.<filter_class>,space: int,color_filter: Color,color_subfilter: Color,position_prefilter: int,current_number: int)
	{
		if (position_prefilter == 1){filter_text = "Tree Scale Select";subfilter_text = "Tree Color Select";} 
		if (!current_layer.active){color_filter += Color(0,0,0,-0.4);}
		if (script.settings.color_scheme){GUI.color = color_filter;}
		EditorGUILayout.BeginHorizontal();
		GUILayout.Space(space+30);
		gui_changed_old = GUI.changed;
		prefilter.foldout = EditorGUILayout.Foldout(prefilter.foldout,prefilter.filter_text);
		GUI.changed = gui_changed_old;
		EditorGUILayout.EndHorizontal();
		        	
		if (prefilter.foldout)
		{
			EditorGUILayout.BeginHorizontal();
			GUILayout.Space(space+45);
			if (GUILayout.Button("+",GUILayout.Width(25)))
			{
				add_filter(prefilter.filter_index.Count-1,prelayer,prefilter);
				if (script.generate_auto){generate_auto();}
			}
			if (GUILayout.Button("-",GUILayout.Width(25)) && prefilter.filter_index.Count > 0 && key.control)
			{
				if (!key.shift)
				{
					Undo.RegisterUndo(script,"Erase Filter");
					erase_filter(prefilter.filter_index.Count-1,prefilter);
				}
				else
				{
					Undo.RegisterUndo(script,"Erase FilterS");
					script.erase_filters(prefilter);
				}
				if (script.generate_auto){generate_auto();}
			}
			if (GUILayout.Button("F",GUILayout.Width(20)))
			{
				prefilter.filters_foldout = !prefilter.filters_foldout;
				script.change_filters_foldout(prefilter,key.shift);
			}
			if (GUILayout.Button("A",GUILayout.Width(20)))
			{
				prefilter.filters_active = !prefilter.filters_active;
				script.change_filters_active(prefilter,key.shift);
				if (script.generate_auto){generate_auto();}
			}
			if (position_prefilter == 1)
			{
				if (current_layer.tree_output.tree.Count > 1)
				{
					if (GUILayout.Button(">Set All",GUILayout.Width(65)))
					{
						Undo.RegisterUndo(script,"Set All Tree Filters");
						if (script.generate_auto){generate_auto();}
						script.set_all_tree_filters(current_layer.tree_output,current_number,key.shift);
					}
				}
			}
			EditorGUILayout.EndHorizontal();
		}
		   	
		// filter loop
		for (count_filter = 0;count_filter < prefilter.filter_index.Count;++count_filter)
		{
			current_filter = script.filter[prefilter.filter_index[count_filter]];
			if (prefilter.foldout)
			{
				color_filter = script.settings.color.color_filter;
				
				if (!current_filter.active){color_filter += Color(-0.3,-0.3,-0.3,0);}
				if (!current_layer.active){color_filter += Color(0,0,0,-0.4);}
		        	
		        if (current_filter.color_filter != color_filter)
			    {
			    	if (current_filter.color_filter[0] > color_filter[0]){current_filter.color_filter[0] -= 0.004;} 
			        	else if (current_filter.color_filter[0]+0.01 < color_filter[0]){current_filter.color_filter[0] += 0.004;}	
			        		else {current_filter.color_filter[0] = color_filter[0];}
			        if (current_filter.color_filter[1] > color_filter[1]){current_filter.color_filter[1] -= 0.004;} 
			        	else if (current_filter.color_filter[1]+0.01 < color_filter[1]){current_filter.color_filter[1] += 0.004;}
			           		else {current_filter.color_filter[1] = color_filter[1];}
					if (current_filter.color_filter[2] > color_filter[2]){current_filter.color_filter[2] -= 0.004;} 
						else if (current_filter.color_filter[2]+0.01 < color_filter[2]){current_filter.color_filter[2] += 0.004;}
							else {current_filter.color_filter[2] = color_filter[2];}
					if (current_filter.color_filter[3] > color_filter[3]){current_filter.color_filter[3] -= 0.004;} 
						else if (current_filter.color_filter[3]+0.01 < color_filter[3]){current_filter.color_filter[3] += 0.004;}
							else {current_filter.color_filter[3] = color_filter[3];}
			        this.Repaint();
				}
				if (script.settings.color_scheme){GUI.color = current_filter.color_filter;} else {GUI.color = Color.white;}
				
				if (script.settings.box_scheme){GUILayout.BeginVertical("Box");}												
				EditorGUILayout.BeginHorizontal();
				GUILayout.Space(space+45);
				
				// filter text
				if (!script.settings.database_display)
				{
					gui_changed_old = GUI.changed;
					current_filter.foldout = EditorGUILayout.Foldout(current_filter.foldout,filter_text+count_filter+" ("+current_filter.type+")");
					GUI.changed = gui_changed_old;
				}
				else
				{
					gui_changed_old = GUI.changed;
					current_filter.foldout = EditorGUILayout.Foldout(current_filter.foldout,filter_text+""+count_filter+" ("+current_filter.type+")"+":--> "+prefilter.filter_index[count_filter]);
					GUI.changed = gui_changed_old;
				}
				if (!script.settings.toggle_text_no)
				{
					if (script.settings.toggle_text_long){EditorGUILayout.LabelField("Active",GUILayout.Width(50));} else {EditorGUILayout.LabelField("Act",GUILayout.Width(28));}
				}
				
				current_filter.active = EditorGUILayout.Toggle(current_filter.active,GUILayout.Width(25));
							 			 
				if (GUILayout.Button("<",GUILayout.Width(25)) && count_filter > 0)
				{
					script.swap_filter(prefilter,count_filter,prefilter,count_filter-1);
					if (script.generate_auto){generate_auto();}
				} 
				if (GUILayout.Button(current_filter.swap_text,GUILayout.Width(35)))
		        {
					swap_filter(current_filter,count_filter,prefilter);
			  	} 		
				if (GUILayout.Button(">",GUILayout.Width(25)) && count_filter < prefilter.filter_index.Count-1)
				{
					script.swap_filter(prefilter,count_filter,prefilter,count_filter+1);
					if (script.generate_auto){generate_auto();}
				} 		 
				if (GUILayout.Button("+",GUILayout.Width(25)))
				{
					add_filter(count_filter,prelayer,prefilter);
					if (script.generate_auto){generate_auto();}
				} 		 
				if (GUILayout.Button("-",GUILayout.Width(25)) && key.control && prefilter.filter_index.Count > 0)
				{
					erase_filter(count_filter,prefilter);
					if (script.generate_auto){generate_auto();}
				} 
									 
				EditorGUILayout.EndHorizontal();
							
				GUILayout.Space(2);
				if (current_filter.foldout)
				{
					if (current_layer.output == layer_output_enum.color)
					{
						EditorGUILayout.BeginHorizontal();
						GUILayout.Space(space+60);
						current_filter.color_output_index = EditorGUILayout.Popup("Color Output",current_filter.color_output_index,current_layer.color_output.precolor_range_enum);
						EditorGUILayout.EndHorizontal();
					}
					
					EditorGUILayout.BeginHorizontal();
					GUILayout.Space(space+60);
					EditorGUILayout.LabelField("Device",GUILayout.Width(145));
					current_filter.device = EditorGUILayout.EnumPopup(current_filter.device);
					EditorGUILayout.EndHorizontal();
					
					GUILayout.Space(5);
					
					EditorGUILayout.BeginHorizontal();
					GUILayout.Space(space+60);
					EditorGUILayout.LabelField("Input",GUILayout.Width(145));
					if (current_filter.device == filter_devices_enum.Standard)
					{
						gui_changed_old = GUI.changed;
						GUI.changed = false;
						current_filter.type = EditorGUILayout.EnumPopup(current_filter.type);
						if (GUI.changed)
						{
							gui_changed_old = true;
							if (current_filter.type == condition_type_enum.RawHeightmap)
							{
								if (current_filter.raw == null)
								{
									current_filter.raw = new raw_class();
								}
							}
						}
						GUI.changed = gui_changed_old;
					}
					else if (current_filter.device == filter_devices_enum.Math)
					{
						current_filter.type2 = EditorGUILayout.EnumPopup(current_filter.type2);
					}
					EditorGUILayout.EndHorizontal();
					
					if (current_filter.type == condition_type_enum.RawHeightmap)
					{
						draw_raw_heightmap(current_filter.raw,space);	 
					}
					if (current_filter.type == condition_type_enum.Image)
					{
						draw_image(current_filter.preimage,space,color_filter,true,1);			
					}
					if (current_filter.type == condition_type_enum.Direction)
					{	
						EditorGUILayout.BeginHorizontal();
						GUILayout.Space(space+60);
						EditorGUILayout.LabelField("Normal X",GUILayout.Width(80));
						if (GUILayout.Button(current_filter.precurve_x_left.curve_text,GUILayout.Width(63)))
						{
							curve_menu_button(current_filter.precurve_x_left,script.get_output_length(current_layer),current_filter.curve_x_left_menu_rect);
						}
						if (key.type == EventType.Repaint){current_filter.curve_x_left_menu_rect = GUILayoutUtility.GetLastRect();}
						current_filter.precurve_x_left.curve = EditorGUILayout.CurveField(current_filter.precurve_x_left.curve);
						current_filter.precurve_x_right.curve = EditorGUILayout.CurveField(current_filter.precurve_x_right.curve);
						if (GUILayout.Button(current_filter.precurve_x_right.curve_text,GUILayout.Width(63)))
						{
							curve_menu_button(current_filter.precurve_x_right,script.get_output_length(current_layer),current_filter.curve_x_right_menu_rect);
						}
						if (key.type == EventType.Repaint){current_filter.curve_x_right_menu_rect = GUILayoutUtility.GetLastRect();}
						EditorGUILayout.EndHorizontal();
											
						EditorGUILayout.BeginHorizontal();
						GUILayout.Space(space+60);
						EditorGUILayout.LabelField("Normal Z",GUILayout.Width(80));
						if (GUILayout.Button(current_filter.precurve_z_left.curve_text,GUILayout.Width(63)))
						{
							curve_menu_button(current_filter.precurve_z_left,script.get_output_length(current_layer),current_filter.curve_z_left_menu_rect);
						}
						if (key.type == EventType.Repaint){current_filter.curve_z_left_menu_rect = GUILayoutUtility.GetLastRect();}
						current_filter.precurve_z_left.curve = EditorGUILayout.CurveField(current_filter.precurve_z_left.curve);
						current_filter.precurve_z_right.curve = EditorGUILayout.CurveField(current_filter.precurve_z_right.curve);
						if (GUILayout.Button(current_filter.precurve_z_right.curve_text,GUILayout.Width(63)))
						{
							curve_menu_button(current_filter.precurve_z_right,script.get_output_length(current_layer),current_filter.curve_z_right_menu_rect);
						}
						if (key.type == EventType.Repaint){current_filter.curve_z_right_menu_rect = GUILayoutUtility.GetLastRect();}
						EditorGUILayout.EndHorizontal();
											
						EditorGUILayout.BeginHorizontal();
						GUILayout.Space(space+60);
						EditorGUILayout.LabelField("Normal Y",GUILayout.Width(147));
						current_filter.precurve_y.curve = EditorGUILayout.CurveField(current_filter.precurve_y.curve);
						if (GUILayout.Button(current_filter.precurve_y.curve_text,GUILayout.Width(63)))
						{
							curve_menu_button(current_filter.precurve_y,script.get_output_length(current_layer),current_filter.curve_y_menu_rect);
						}
						if (key.type == EventType.Repaint){current_filter.curve_y_menu_rect = GUILayoutUtility.GetLastRect();}
						EditorGUILayout.EndHorizontal();
					}
								
					if (current_filter.type == condition_type_enum.RandomRange)
					{
						EditorGUILayout.BeginHorizontal();
						GUILayout.Space(space+60);
						current_filter.range_start = EditorGUILayout.FloatField("Range Start",current_filter.range_start);
						EditorGUILayout.EndHorizontal();
						EditorGUILayout.BeginHorizontal();
						GUILayout.Space(space+60);
						current_filter.range_end = EditorGUILayout.FloatField("Range End",current_filter.range_end);
						EditorGUILayout.EndHorizontal();
					}							
					
					EditorGUILayout.BeginHorizontal();
					GUILayout.Space(space+60);
					EditorGUILayout.LabelField("Output",GUILayout.Width(145));
					current_filter.output = EditorGUILayout.EnumPopup(current_filter.output);
					EditorGUILayout.EndHorizontal();
					
					if (current_filter.output == condition_output_enum.change)
					{
						EditorGUILayout.BeginHorizontal();
						GUILayout.Space(space+60);
						EditorGUILayout.LabelField("Level",GUILayout.Width(145));
						current_filter.change_mode = EditorGUILayout.EnumPopup(current_filter.change_mode);
						EditorGUILayout.EndHorizontal();
					}	
	
					if (current_filter.type == condition_type_enum.Always)
					{
						EditorGUILayout.BeginHorizontal();
						GUILayout.Space(space+60);
						EditorGUILayout.LabelField("Position",GUILayout.Width(145));
						current_filter.curve_position = EditorGUILayout.Slider(current_filter.curve_position,0,1);
						EditorGUILayout.EndHorizontal();
					}
												
					EditorGUILayout.BeginHorizontal();
					GUILayout.Space(space+60);
					EditorGUILayout.LabelField("Strength",GUILayout.Width(145));
					current_filter.strength = EditorGUILayout.Slider(current_filter.strength,0,4);
					EditorGUILayout.EndHorizontal();
					
					draw_curve(current_filter.precurve_list,space,color_filter);
					
					draw_subfilter(prelayer,current_filter,color_subfilter,space);	
									
				}
				if (script.settings.box_scheme){GUILayout.EndVertical();}
	  		}
	  		
	  	}
		GUILayout.Space(5);
	}
	
	function draw_curve(precurve_list: List.<animation_curve_class>,space: int,color_curve: Color)
	{
		EditorGUILayout.BeginHorizontal();
		GUILayout.Space(space+60);
		gui_changed_old = GUI.changed;
		current_filter.curve_foldout = EditorGUILayout.Foldout(current_filter.curve_foldout,"Curves");
		GUI.changed = gui_changed_old;
		EditorGUILayout.EndHorizontal();
		
		
		if (current_filter.curve_foldout)
		{
			for (var count_curve: int = 0;count_curve < precurve_list.Count;++count_curve)
			{
				if (!precurve_list[count_curve].active){color_curve += Color(-0.3,-0.3,-0.3,0);}
				if (script.settings.color_scheme){GUI.color = color_curve;}
				
				EditorGUILayout.BeginHorizontal();
				GUILayout.Space(space+75);
				EditorGUILayout.LabelField("Curve ("+precurve_list[count_curve].type+")",GUILayout.Width(130));
				precurve_list[count_curve].curve = EditorGUILayout.CurveField(precurve_list[count_curve].curve);
				if (GUILayout.Button(precurve_list[count_curve].curve_text,EditorStyles.miniButtonMid,GUILayout.Width(63)))
				{
					if (key.control && !key.shift)
					{
						Undo.RegisterUndo(script,"Default Curve");
						precurve_list[count_curve].set_default();
						if (script.generate_auto){generate_auto();}
					}
					else if (key.alt)
					{
						if (key.shift)
						{
							script.loop_prelayer("(sad)",0,true);
						}
					}
					else
					{
						curve_menu_button(precurve_list[count_curve],script.get_output_length(current_layer),precurve_list[count_curve].menu_rect);
					}
				}
				if (key.type == EventType.Repaint){precurve_list[count_curve].menu_rect = GUILayoutUtility.GetLastRect();}
				precurve_list[count_curve].type = EditorGUILayout.EnumPopup(precurve_list[count_curve].type,GUILayout.Width(64));
				if (!script.settings.toggle_text_no)
				{
					if (script.settings.toggle_text_long){EditorGUILayout.LabelField("Active",GUILayout.Width(50));} else {EditorGUILayout.LabelField("Act",GUILayout.Width(28));}
				}
				precurve_list[count_curve].active = EditorGUILayout.Toggle(precurve_list[count_curve].active,GUILayout.Width(25));
				if (GUILayout.Button("<",EditorStyles.miniButtonMid,GUILayout.Width(25)))
				{
					if (count_curve > 0)
					{
						script.swap_animation_curve(precurve_list,count_curve,count_curve-1);
						if (script.generate_auto){generate_auto();}
					}
				}
				if (GUILayout.Button(">",EditorStyles.miniButtonMid,GUILayout.Width(25)))
				{
					if (count_curve < precurve_list.Count-1)
					{
						script.swap_animation_curve(precurve_list,count_curve,count_curve+1);
						if (script.generate_auto){generate_auto();}
					}
				}
				if (GUILayout.Button("+",EditorStyles.miniButtonMid,GUILayout.Width(25)))
				{
					if (!key.shift){script.add_animation_curve(precurve_list,count_curve+1,false);}
						else {script.add_animation_curve(precurve_list,count_curve+1,true);}
					if (script.generate_auto){generate_auto();}
				} 		 
				if (GUILayout.Button("-",EditorStyles.miniButtonMid,GUILayout.Width(25)) && key.control)
				{
					if (precurve_list.Count > 1)
					{
						Undo.RegisterUndo(script,"Erase Curve");
						script.erase_animation_curve(precurve_list,count_curve);
						if (script.generate_auto){generate_auto();}
						this.Repaint();
						return;
					}
					else
					{
						precurve_list[count_curve].active = false;
					}
				} 						
				
				EditorGUILayout.EndHorizontal();
				
				if (precurve_list[count_curve].type == curve_type_enum.Perlin)
				{
					EditorGUILayout.BeginHorizontal();
					GUILayout.Space(space+90);
					gui_changed_old = GUI.changed;
					precurve_list[count_curve].settings_foldout = EditorGUILayout.Foldout(precurve_list[count_curve].settings_foldout,"Settings");
					GUI.changed = gui_changed_old;
					EditorGUILayout.EndHorizontal();
					
					if (precurve_list[count_curve].settings_foldout)
					{
						
						EditorGUILayout.BeginHorizontal();
						GUILayout.Space(space+105);
						EditorGUILayout.EndHorizontal();
						
						EditorGUILayout.BeginHorizontal();
						GUILayout.Space(space+105);
						EditorGUILayout.LabelField("Zoom",GUILayout.Width(130));
						precurve_list[count_curve].frequency = EditorGUILayout.Slider(precurve_list[count_curve].frequency,3,4096);
						EditorGUILayout.EndHorizontal();
						
						EditorGUILayout.BeginHorizontal();
						GUILayout.Space(space+105);
						EditorGUILayout.LabelField("Detail",GUILayout.Width(130));
						precurve_list[count_curve].detail = EditorGUILayout.Slider(precurve_list[count_curve].detail,1,12);
						EditorGUILayout.EndHorizontal();
						
					
						EditorGUILayout.BeginHorizontal();
						GUILayout.Space(space+105);
						EditorGUILayout.LabelField("Detail Strength",GUILayout.Width(130));
						precurve_list[count_curve].detail_strength = EditorGUILayout.Slider(precurve_list[count_curve].detail_strength,1,12);
						EditorGUILayout.EndHorizontal();
						
						
						EditorGUILayout.BeginHorizontal();
						GUILayout.Space(space+105);
						EditorGUILayout.LabelField("Offset Range",GUILayout.Width(130));
						if (precurve_list[count_curve].offset_range.x < 1){EditorGUILayout.LabelField(precurve_list[count_curve].offset_range.x.ToString("F2"),GUILayout.Width(50));}
							else {EditorGUILayout.LabelField(precurve_list[count_curve].offset_range.x.ToString("F0"),GUILayout.Width(50));}
						if (GUILayout.Button("+",EditorStyles.miniButtonMid,GUILayout.Width(30)))
						{
							precurve_list[count_curve].offset_range.x *= 2;
							precurve_list[count_curve].offset_range.y *= 2;
							precurve_list[count_curve].offset_middle.x = precurve_list[count_curve].offset.x;
							precurve_list[count_curve].offset_middle.y = precurve_list[count_curve].offset.y;
						}
						if (GUILayout.Button("-",EditorStyles.miniButtonMid,GUILayout.Width(30)))
						{
							if (precurve_list[count_curve].offset_range.x > 0.001)
							{
								precurve_list[count_curve].offset_range.x = precurve_list[count_curve].offset_range.x / 2;
								precurve_list[count_curve].offset_range.y = precurve_list[count_curve].offset_range.y / 2;
								precurve_list[count_curve].offset_middle.x = precurve_list[count_curve].offset.x;
								precurve_list[count_curve].offset_middle.y = precurve_list[count_curve].offset.y;
							}
						}
						GUILayout.Space(5);
						if (GUILayout.Button("Randomize",EditorStyles.miniButtonMid,GUILayout.Width(70)))
						{
							UnityEngine.Random.seed = EditorApplication.timeSinceStartup;
							precurve_list[count_curve].offset = Vector2(UnityEngine.Random.Range(-precurve_list[count_curve].offset_range.x+precurve_list[count_curve].offset_middle.x,precurve_list[count_curve].offset_range.y+precurve_list[count_curve].offset_middle.x),UnityEngine.Random.Range(-precurve_list[count_curve].offset_range.y+precurve_list[count_curve].offset_middle.y,precurve_list[count_curve].offset_range.y+precurve_list[count_curve].offset_middle.y));
							if (script.generate_auto){generate_auto();}
						}
						if (GUILayout.Button("Reset",EditorStyles.miniButtonMid,GUILayout.Width(70)))
						{
							precurve_list[count_curve].offset = Vector2(0,0);
							precurve_list[count_curve].offset_middle = Vector2(0,0);
							if (script.generate_auto){generate_auto();}
						}
						EditorGUILayout.EndHorizontal();							
									
						EditorGUILayout.BeginHorizontal();
						GUILayout.Space(space+105);
						EditorGUILayout.LabelField("Offset X",GUILayout.Width(130));
						precurve_list[count_curve].offset.x = EditorGUILayout.Slider(precurve_list[count_curve].offset.x,-precurve_list[count_curve].offset_range.x+precurve_list[count_curve].offset_middle.x,precurve_list[count_curve].offset_range.y+precurve_list[count_curve].offset_middle.x);
						EditorGUILayout.EndHorizontal();
								
						EditorGUILayout.BeginHorizontal();
						GUILayout.Space(space+105);
						EditorGUILayout.LabelField("Offset Y",GUILayout.Width(130));
						precurve_list[count_curve].offset.y = EditorGUILayout.Slider(precurve_list[count_curve].offset.y,-precurve_list[count_curve].offset_range.y+precurve_list[count_curve].offset_middle.y,precurve_list[count_curve].offset_range.y+precurve_list[count_curve].offset_middle.y);
						EditorGUILayout.EndHorizontal();
						
						EditorGUILayout.BeginHorizontal();
						GUILayout.Space(space+105);
						EditorGUILayout.LabelField("Abs",GUILayout.Width(130));
						gui_changed_old = GUI.changed;
						GUI.changed = false;
						precurve_list[count_curve].abs = EditorGUILayout.Toggle(precurve_list[count_curve].abs,GUILayout.Width(25));
						if (GUI.changed)
						{
							gui_changed_old = true;
						}
						GUI.changed = gui_changed_old;
						EditorGUILayout.EndHorizontal();
					}
				}
				else if (precurve_list[count_curve].type == curve_type_enum.Random)
				{
					EditorGUILayout.BeginHorizontal();
					GUILayout.Space(space+90);
					EditorGUILayout.LabelField("Abs",GUILayout.Width(130));
					gui_changed_old = GUI.changed;
					GUI.changed = false;
					precurve_list[count_curve].abs = EditorGUILayout.Toggle(precurve_list[count_curve].abs,GUILayout.Width(25));
					if (GUI.changed)
					{
						gui_changed_old = true;
					}
					GUI.changed = gui_changed_old;
					EditorGUILayout.EndHorizontal();
				}
				
				
				if (!precurve_list[count_curve].active){color_curve += Color(0.3,0.3,0.3,0);}
			}
		}
	}
	
	function draw_subfilter(prelayer: prelayer_class,current_filter: filter_class,color_subfilter: Color,space: int)
	{
		// subfilter
		if (!script.settings.color_scheme){color_subfilter = Color.white;}
		if (!current_filter.active || !current_layer.active){color_subfilter += Color(0,0,0,-0.4);}
	    GUI.color = color_subfilter;
		EditorGUILayout.BeginHorizontal();
		GUILayout.Space(space+60);
		
		// presubfilter text
		gui_changed_old = GUI.changed;
		current_filter.presubfilter.foldout = EditorGUILayout.Foldout(current_filter.presubfilter.foldout,current_filter.presubfilter.subfilter_text);
		GUI.changed = gui_changed_old;
		EditorGUILayout.EndHorizontal();
		if (current_filter.presubfilter.foldout)
		{
			EditorGUILayout.BeginHorizontal();
			GUILayout.Space(space+75);
			if (GUILayout.Button("+",GUILayout.Width(25)))
			{
				add_subfilter(current_filter.presubfilter.subfilter_index.Count-1,prelayer,current_filter.presubfilter);
				if (script.generate_auto){generate_auto();}
			}
		    if (GUILayout.Button("-",GUILayout.Width(25)) && current_filter.presubfilter.subfilter_index.Count > 0 && key.control)
		    {
		    	if (!key.shift)
		    	{
		    		Undo.RegisterUndo(script,"Erase subfilter");
					erase_subfilter(current_filter.presubfilter.subfilter_index.Count-1,current_filter.presubfilter);
				}
				else
				{
					Undo.RegisterUndo(script,"Erase subilters");
					script.erase_subfilters(current_filter);
				}
		    	if (script.generate_auto){generate_auto();}
		    }
		    if (GUILayout.Button("F",GUILayout.Width(20)))
			{
				current_filter.presubfilter.subfilters_foldout = !current_filter.presubfilter.subfilters_foldout;
				script.change_subfilters_foldout(current_filter.presubfilter,key.shift);
			} 
		    if (GUILayout.Button("A",GUILayout.Width(20)))
			{
				current_filter.presubfilter.subfilters_active = !current_filter.presubfilter.subfilters_active;
				script.change_subfilters_active(current_filter.presubfilter,key.shift);
				if (script.generate_auto){generate_auto();}
			}
			
			EditorGUILayout.EndHorizontal();
									
			//subfilter foldout
			if (current_filter.presubfilter.subfilter_index.Count > 0)
			{
				for (count_subfilter = 0;count_subfilter < current_filter.presubfilter.subfilter_index.Count;++count_subfilter)
				{
					current_subfilter = script.subfilter[current_filter.presubfilter.subfilter_index[count_subfilter]];		
					
					color_subfilter = script.settings.color.color_subfilter;
					
					if (!current_subfilter.active){color_subfilter += Color(-0.3,-0.3,-0.3,0);}
					if (!current_filter.active || !current_layer.active){color_subfilter += Color(0,0,0,-0.4);}
	        	
			        if (current_subfilter.color_subfilter != color_subfilter)
				    {
				    	if (current_subfilter.color_subfilter[0] > color_subfilter[0]){current_subfilter.color_subfilter[0] -= 0.004;} 
				        	else if (current_subfilter.color_subfilter[0]+0.01 < color_subfilter[0]){current_subfilter.color_subfilter[0] += 0.004;}	
				        		else {current_subfilter.color_subfilter[0] = color_subfilter[0];}
				        if (current_subfilter.color_subfilter[1] > color_subfilter[1]){current_subfilter.color_subfilter[1] -= 0.004;} 
				        	else if (current_subfilter.color_subfilter[1]+0.01 < color_subfilter[1]){current_subfilter.color_subfilter[1] += 0.004;}
				           		else {current_subfilter.color_subfilter[1] = color_subfilter[1];}
						if (current_subfilter.color_subfilter[2] > color_subfilter[2]){current_subfilter.color_subfilter[2] -= 0.004;} 
							else if (current_subfilter.color_subfilter[2]+0.01 < color_subfilter[2]){current_subfilter.color_subfilter[2] += 0.004;}
								else {current_subfilter.color_subfilter[2] = color_subfilter[2];}
						if (current_subfilter.color_subfilter[3] > color_subfilter[3]){current_subfilter.color_subfilter[3] -= 0.004;} 
							else if (current_subfilter.color_subfilter[3]+0.01 < color_subfilter[3]){current_subfilter.color_subfilter[3] += 0.004;}
								else {current_subfilter.color_subfilter[3] = color_subfilter[3];}
				        this.Repaint();
					}
			    	if (script.settings.color_scheme){GUI.color = current_subfilter.color_subfilter;} else {GUI.color = Color.white;}
					
					if (script.settings.box_scheme){GUILayout.BeginVertical("Box");}
					EditorGUILayout.BeginHorizontal();
					GUILayout.Space(space+75);
					
					// subfilter text	
					var random_range_text: String;
					if (!script.settings.database_display)
					{
						gui_changed_old = GUI.changed;
						current_subfilter.foldout = EditorGUILayout.Foldout(current_subfilter.foldout,subfilter_text+count_subfilter+" ("+current_subfilter.type+")"+random_range_text);
						GUI.changed = gui_changed_old;
					}
					else
					{
						gui_changed_old = GUI.changed;
						current_subfilter.foldout = EditorGUILayout.Foldout(current_subfilter.foldout,subfilter_text+count_subfilter+" ("+current_subfilter.type+")"+random_range_text+":--> "+current_filter.presubfilter.subfilter_index[count_subfilter]);
						GUI.changed = gui_changed_old;
					}
					if (!script.settings.toggle_text_no)
					{
						if (script.settings.toggle_text_long){EditorGUILayout.LabelField("Active",GUILayout.Width(50));} else {EditorGUILayout.LabelField("Act",GUILayout.Width(28));}
					}
							gui_changed_old = GUI.changed;
							GUI.changed = false;
							current_subfilter.active = EditorGUILayout.Toggle(current_subfilter.active,GUILayout.Width(25));
							if (GUI.changed)
							{
								gui_changed_old = true;
							}
							GUI.changed = gui_changed_old;
							
					if (GUILayout.Button("<",GUILayout.Width(25)) && count_subfilter > 0)
					{
						script.swap_subfilter(current_filter.presubfilter,count_subfilter,current_filter.presubfilter,count_subfilter-1);
						if (script.generate_auto){generate_auto();}
					} 
					if (GUILayout.Button(current_subfilter.swap_text,GUILayout.Width(34)))
					{
						swap_subfilter(current_subfilter,count_subfilter,current_filter.presubfilter);
					} 		
					if (GUILayout.Button(">",GUILayout.Width(25)) && count_subfilter < current_filter.presubfilter.subfilter_index.Count-1)
					{
						script.swap_subfilter(current_filter.presubfilter,count_subfilter,current_filter.presubfilter,count_subfilter+1);
						if (script.generate_auto){generate_auto();}
					} 		 
					if (GUILayout.Button("+",GUILayout.Width(25)))
					{
						add_subfilter(count_subfilter,prelayer,current_filter.presubfilter);
						if (script.generate_auto){generate_auto();}
					} 		 
					if (GUILayout.Button("-",GUILayout.Width(25)) && key.control)
					{
						erase_subfilter(count_subfilter,current_filter.presubfilter);
						if (script.generate_auto){generate_auto();}
					} 
					
					EditorGUILayout.EndHorizontal();
					if (current_subfilter.foldout)
					{
						GUILayout.Space(2);
						EditorGUILayout.BeginHorizontal();
						GUILayout.Space(space+90);
						EditorGUILayout.LabelField("Mode",GUILayout.Width(145));
						current_subfilter.mode = EditorGUILayout.EnumPopup(current_subfilter.mode);
						EditorGUILayout.EndHorizontal();
	
						if (current_subfilter.type == condition_type_enum.MaxCount)
						{
							EditorGUILayout.BeginHorizontal();
							GUILayout.Space(space+90);
							EditorGUILayout.LabelField("Max Count",GUILayout.Width(145));
							current_subfilter.output_max = EditorGUILayout.IntField(current_subfilter.output_max);
							EditorGUILayout.EndHorizontal();
							
							EditorGUILayout.BeginHorizontal();
							GUILayout.Space(space+90);
							EditorGUILayout.LabelField("Min Value",GUILayout.Width(145));
							current_subfilter.output_count_min = EditorGUILayout.FloatField(current_subfilter.output_count_min);
							EditorGUILayout.EndHorizontal();
							
							GUILayout.Space(5);
							EditorGUILayout.BeginHorizontal();
							GUILayout.Space(space+90);
							EditorGUILayout.LabelField("Input",GUILayout.Width(145));
							current_subfilter.type = EditorGUILayout.EnumPopup(current_subfilter.type);
							EditorGUILayout.EndHorizontal();
						}
						else
						{
							GUILayout.Space(5);
							EditorGUILayout.BeginHorizontal();
							GUILayout.Space(space+90);
							EditorGUILayout.LabelField("Input",GUILayout.Width(145));
							current_subfilter.type = EditorGUILayout.EnumPopup(current_subfilter.type);
							EditorGUILayout.EndHorizontal();
						
							if (current_subfilter.mode == subfilter_mode_enum.strength)
							{
								EditorGUILayout.BeginHorizontal();
								GUILayout.Space(space+90);
								EditorGUILayout.LabelField("Output",GUILayout.Width(145));
								current_subfilter.output = EditorGUILayout.EnumPopup(current_subfilter.output);
								EditorGUILayout.EndHorizontal();
							}
							
							if (current_subfilter.type == condition_type_enum.Image)
							{
								draw_image(current_subfilter.preimage,30+space,color_subfilter,true,2);							
							}
							
							if (current_subfilter.type == condition_type_enum.Always)
							{
								EditorGUILayout.BeginHorizontal();
								GUILayout.Space(space+90);
								EditorGUILayout.LabelField("Position",GUILayout.Width(145));
								current_subfilter.curve_position = EditorGUILayout.Slider(current_subfilter.curve_position,0,1);
								EditorGUILayout.EndHorizontal();
							}
		
							EditorGUILayout.BeginHorizontal();
							GUILayout.Space(space+90);
							EditorGUILayout.LabelField("Strength",GUILayout.Width(145));
							current_subfilter.strength = EditorGUILayout.Slider(current_subfilter.strength,0,1);
							EditorGUILayout.EndHorizontal();
													
							if (current_subfilter.type == condition_type_enum.RandomRange)
							{
								EditorGUILayout.BeginHorizontal();
								GUILayout.Space(space+90);
								EditorGUILayout.LabelField("Range Start",GUILayout.Width(145));
								current_subfilter.range_start = EditorGUILayout.FloatField(current_subfilter.range_start);
								EditorGUILayout.EndHorizontal();
								EditorGUILayout.BeginHorizontal();
								GUILayout.Space(space+90);
								EditorGUILayout.LabelField("Range End",GUILayout.Width(145));
								current_subfilter.range_end = EditorGUILayout.FloatField(current_subfilter.range_end);
								EditorGUILayout.EndHorizontal();
							}
													
							draw_curve(current_subfilter.precurve_list,space+30,color_subfilter);
						}
					}
					GUILayout.Space(1);
					if (script.settings.box_scheme){GUILayout.EndVertical();}
				}
			}
		}
	}
	
	function draw_auto_search(auto_search: auto_search_class,space: int)
	{
		EditorGUILayout.BeginHorizontal();
		GUILayout.Space(space+225);
		EditorGUILayout.LabelField("Naming String",GUILayout.Width(115));
		gui_changed_old = GUI.changed;
		GUI.changed = false;
		auto_search.format = EditorGUILayout.TextField(auto_search.format,GUILayout.Width(119));
		EditorGUILayout.LabelField("("+auto_search.output_format+")");
		EditorGUILayout.EndHorizontal();
				
		EditorGUILayout.BeginHorizontal();
		GUILayout.Space(space+225);
		EditorGUILayout.LabelField("Digits Length",GUILayout.Width(115));
		auto_search.digits = EditorGUILayout.IntField(auto_search.digits,GUILayout.Width(119));
		EditorGUILayout.EndHorizontal();
				
		EditorGUILayout.BeginHorizontal();
		GUILayout.Space(space+225);
		EditorGUILayout.LabelField("Start %x",GUILayout.Width(115));
		auto_search.start_x = EditorGUILayout.IntField(auto_search.start_x,GUILayout.Width(119));
		if (auto_search.start_x < 0){auto_search.start_x = 0;}
		EditorGUILayout.EndHorizontal();
		
		EditorGUILayout.BeginHorizontal();
		GUILayout.Space(space+225);
		EditorGUILayout.LabelField("Start %y",GUILayout.Width(115));
		auto_search.start_y = EditorGUILayout.IntField(auto_search.start_y,GUILayout.Width(119));
		if (auto_search.start_y < 0){auto_search.start_n = 0;}
		EditorGUILayout.EndHorizontal();
			
		EditorGUILayout.BeginHorizontal();
		GUILayout.Space(space+225);
		EditorGUILayout.LabelField("Start %n",GUILayout.Width(115));
		auto_search.start_n = EditorGUILayout.IntField(auto_search.start_n,GUILayout.Width(119));
		if (auto_search.start_n < 0){auto_search.start_y = 0;}
		EditorGUILayout.EndHorizontal();
		if (GUI.changed)
		{
			auto_search.set_output_format();
		}
		GUI.changed = gui_changed_old;
		GUILayout.Space(5);
	}	
					
	function draw_image(preimage: image_class,space: int,color_filter: Color,draw_color_range: boolean,call_from: int)
	{
		EditorGUILayout.BeginHorizontal();
		GUILayout.Space(space+210);
		if (script.settings.color_scheme){GUI.color = Color.white;}							
		var count_row: int = 0;
		for (var count_image: int = 0;count_image < preimage.image.Count;++count_image)
		{
			gui_changed_old = GUI.changed;
			GUI.changed = false;
			preimage.image[count_image] = EditorGUILayout.ObjectField(preimage.image[count_image],Texture2D,true,GUILayout.Width(50),GUILayout.Height(50)) as Texture2D;
			if (GUI.changed)
			{	
				gui_changed_old = true;
				if (preimage.pattern)
				{
					preimage.pattern_width = preimage.image.width / preimage.pattern_list[0].count_x;
					preimage.pattern_height = preimage.image.height / preimage.pattern_list[0].count_y;
				}
				if (preimage.image[count_image])
				{
					if (count_image == 0){preimage.auto_search.path_full = AssetDatabase.GetAssetPath(preimage.image[0]);}
					set_image_import_settings(preimage.image[count_image]);
				}
			}
			if (preimage.image.Count == 1 && preimage.image[count_image]){EditorGUILayout.LabelField(preimage.image[count_image].name);}
			GUI.changed = gui_changed_old;
			++count_row;
			if (count_row >= preimage.list_row)
			{
				count_row = 0;
				EditorGUILayout.EndHorizontal();
				EditorGUILayout.BeginHorizontal();
				GUILayout.Space(space+210);
			}
		}
		EditorGUILayout.EndHorizontal();
		
		if (script.settings.color_scheme){GUI.color = color_filter;}							
		
		EditorGUILayout.BeginHorizontal();
		GUILayout.Space(space+210);
		gui_changed_old = GUI.changed;
		preimage.settings_foldout = EditorGUILayout.Foldout(preimage.settings_foldout,"Settings");
		GUI.changed = gui_changed_old;
		EditorGUILayout.EndHorizontal();
		
		if (preimage.settings_foldout)
		{
			EditorGUILayout.BeginHorizontal();
			GUILayout.Space(space+225);
			EditorGUILayout.LabelField("Flip X",GUILayout.Width(35));
			preimage.flip_x = EditorGUILayout.Toggle(preimage.flip_x,GUILayout.Width(25));
			EditorGUILayout.LabelField("Flip Y",GUILayout.Width(35));
			preimage.flip_y = EditorGUILayout.Toggle(preimage.flip_y,GUILayout.Width(25));
			GUILayout.Space(7);
			EditorGUILayout.LabelField("Auto Scale",GUILayout.Width(65));
			preimage.image_auto_scale = EditorGUILayout.Toggle(preimage.image_auto_scale,GUILayout.Width(25));
			EditorGUILayout.EndHorizontal();
			
			EditorGUILayout.BeginHorizontal();
			GUILayout.Space(space+225);
			if (GUILayout.Button("Adjust List",GUILayout.Width(85)))
			{
				preimage.adjust_list();
			}
			gui_changed_old = GUI.changed;
			GUI.changed = false;
			preimage.list_length = EditorGUILayout.IntField(preimage.list_length,GUILayout.Width(50));
			if (GUI.changed)
			{
				gui_changed_old = true;
				if (preimage.list_length < 1){preimage.list_length = 1;}
			}
			GUI.changed = gui_changed_old;
			if (script.settings.tooltip_mode != 0)
        	{
    			tooltip_text = "Auto complete the list\n(Click)\n\nSet search parameters\n(Alt Click)";
	        }
			if (GUILayout.Button(GUIContent("Auto Search<",tooltip_text),GUILayout.Width(95)))
			{
				if (!key.alt)
				{
					Undo.RegisterUndo(script,"Auto Search Image");
					script.strip_auto_search_file(preimage.auto_search);
					auto_search_list(preimage);
				}
				else
				{
					preimage.auto_search.display = !preimage.auto_search.display;
				}
			}
			EditorGUILayout.EndHorizontal();
			
			if (preimage.auto_search.display)
			{
				draw_auto_search(preimage.auto_search,space);
			}
			
			if (preimage.image.Count > 1)
			{
				EditorGUILayout.BeginHorizontal();
				GUILayout.Space(space+225);
				EditorGUILayout.LabelField("Row Length",GUILayout.Width(115));
				preimage.list_row = EditorGUILayout.IntField(preimage.list_row,GUILayout.Width(70));
				EditorGUILayout.EndHorizontal();
				EditorGUILayout.BeginHorizontal();
				GUILayout.Space(space+225);
				EditorGUILayout.LabelField("List Mode",GUILayout.Width(115));
				preimage.image_list_mode = EditorGUILayout.EnumPopup(preimage.image_list_mode,GUILayout.Width(70));
				EditorGUILayout.EndHorizontal();
			}
			
			EditorGUILayout.BeginHorizontal();
			GUILayout.Space(space+225);
			EditorGUILayout.LabelField("Image Mode",GUILayout.Width(115));
			preimage.image_mode = EditorGUILayout.EnumPopup(preimage.image_mode,GUILayout.Width(109));
			EditorGUILayout.EndHorizontal();
			
			if (!preimage.image_auto_scale)
			{
				EditorGUILayout.BeginHorizontal();
				GUILayout.Space(space+225);
				EditorGUILayout.LabelField("Step X",GUILayout.Width(115));
				preimage.conversion_step.x = EditorGUILayout.FloatField(preimage.conversion_step.x,GUILayout.Width(70));
				EditorGUILayout.EndHorizontal();
				
				EditorGUILayout.BeginHorizontal();
				GUILayout.Space(space+225);
				EditorGUILayout.LabelField("Step Y",GUILayout.Width(115));
				preimage.conversion_step.y = EditorGUILayout.FloatField(preimage.conversion_step.y,GUILayout.Width(70));
				EditorGUILayout.EndHorizontal();
			}
			
			EditorGUILayout.BeginHorizontal();
			GUILayout.Space(space+225);
			EditorGUILayout.LabelField("Scale X",GUILayout.Width(115));
			preimage.tile_x = EditorGUILayout.FloatField(preimage.tile_x,GUILayout.Width(70));
			EditorGUILayout.EndHorizontal();
										
			EditorGUILayout.BeginHorizontal();
			GUILayout.Space(space+225);
			EditorGUILayout.LabelField("Scale Y",GUILayout.Width(115));
			preimage.tile_y = EditorGUILayout.FloatField(preimage.tile_y,GUILayout.Width(70));
			EditorGUILayout.EndHorizontal();
			
			EditorGUILayout.BeginHorizontal();
			GUILayout.Space(space+225);
			EditorGUILayout.LabelField("Clamp",GUILayout.Width(115));
			preimage.clamp = EditorGUILayout.Toggle(preimage.clamp,GUILayout.Width(25));
			EditorGUILayout.EndHorizontal();
			
			EditorGUILayout.BeginHorizontal();
			GUILayout.Space(space+225);
			EditorGUILayout.LabelField("Offset X",GUILayout.Width(115));
			preimage.tile_offset_x = EditorGUILayout.IntField(preimage.tile_offset_x,GUILayout.Width(70));
			EditorGUILayout.EndHorizontal();
		
			EditorGUILayout.BeginHorizontal();
			GUILayout.Space(space+225);
			EditorGUILayout.LabelField("Offset Y",GUILayout.Width(115));
			preimage.tile_offset_y = EditorGUILayout.IntField(preimage.tile_offset_y,GUILayout.Width(70));
			EditorGUILayout.EndHorizontal();
		
			EditorGUILayout.BeginHorizontal();
			GUILayout.Space(space+225);
			EditorGUILayout.LabelField("Rotate",GUILayout.Width(115));
			preimage.rotation = EditorGUILayout.Toggle(preimage.rotation,GUILayout.Width(25));
			EditorGUILayout.EndHorizontal();
			
			if (preimage.rotation)
			{
				EditorGUILayout.BeginHorizontal();
				GUILayout.Space(space+225);
				EditorGUILayout.LabelField("Rotation value",GUILayout.Width(115));
				preimage.rotation_value = EditorGUILayout.Slider(preimage.rotation_value,-180,180);
				EditorGUILayout.EndHorizontal();
			}
			EditorGUILayout.BeginHorizontal();
			GUILayout.Space(space+225);
			EditorGUILayout.LabelField("RGB",GUILayout.Width(115));
			preimage.rgb = EditorGUILayout.Toggle(preimage.rgb,GUILayout.Width(25));
			EditorGUILayout.EndHorizontal();
			
			if (current_layer.output == layer_output_enum.splat)
			{
				EditorGUILayout.BeginHorizontal();
				GUILayout.Space(space+225);
				EditorGUILayout.LabelField("Edge Blur",GUILayout.Width(115));
				preimage.edge_blur = EditorGUILayout.Toggle(preimage.edge_blur,GUILayout.Width(25));
				EditorGUILayout.EndHorizontal();
				
				if (preimage.edge_blur)
				{
					EditorGUILayout.BeginHorizontal();
					GUILayout.Space(space+225);
					EditorGUILayout.LabelField("Edge Blur Radius",GUILayout.Width(115));
					gui_changed_old = GUI.changed;
					GUI.changed = false;
					preimage.edge_blur_radius = EditorGUILayout.FloatField(preimage.edge_blur_radius,GUILayout.Width(70));
					if (GUI.changed)
					{
						gui_changed_old = true;
						if (preimage.edge_blur_radius < 0.5){preimage.edge_blur_radius = 0.5;}
					}
					GUI.changed = gui_changed_old;
					EditorGUILayout.EndHorizontal();
				}
			}
			
			EditorGUILayout.BeginHorizontal();
			GUILayout.Space(space+225);
			EditorGUILayout.LabelField("Image Color",GUILayout.Width(115));
			preimage.image_color = EditorGUILayout.ColorField(preimage.image_color,GUILayout.Width(109));
			EditorGUILayout.EndHorizontal();
		}	
		if (draw_color_range)
		{	
			current_preimage = preimage;
			draw_precolor_range(preimage.precolor_range,space+210,false,0,color_filter,true,false,false,call_from);
		}
	}
	
	function draw_raw_heightmap(raw: raw_class,space: int): int
	{
		var space_list: int = 0;
		if (raw.file_index.Count > 1)
		{
			EditorGUILayout.BeginHorizontal();
			GUILayout.Space(space+210);
			gui_changed_old = GUI.changed;
			raw.foldout = EditorGUILayout.Foldout(raw.foldout,"Raw File List");
			GUI.changed = gui_changed_old;
			EditorGUILayout.EndHorizontal();
			space_list = 15;
		}
		
		if (raw.foldout || raw.file_index.Count < 2)
		{
			for (var count_file_index: int = 0;count_file_index < raw.file_index.Count;++count_file_index)
			{
				if (raw.display_short_list)
				{
					if (count_file_index == 1)
					{
						EditorGUILayout.BeginHorizontal();
						GUILayout.Space(space+space_list+225);
						EditorGUILayout.LabelField("...");
						EditorGUILayout.EndHorizontal();
						continue;
					}
					else if (count_file_index != 0 && count_file_index < raw.file_index.Count-1){continue;}
				}
				
				EditorGUILayout.BeginHorizontal();
				GUILayout.Space(space+space_list+210);
				var raw_file_text: String;
				var raw_file_path: String;
				
				if (raw.file_index[count_file_index] > script.raw_files.Count-1){raw.file_index[count_file_index] = -1;}
				
				if (raw.file_index[count_file_index] > -1)
				{
					raw_file_text = script.raw_files[raw.file_index[count_file_index]].filename;
					raw_file_path = script.raw_files[raw.file_index[count_file_index]].file;
				}
				else
				{
					raw_file_text = "Not Loaded";
					raw_file_path = "";
				}
				
				gui_changed_old = GUI.changed;
				raw.file_foldout[count_file_index] = EditorGUILayout.Foldout(raw.file_foldout[count_file_index],GUIContent(raw_file_text+" ("+count_file_index+")",raw_file_path));
				GUI.changed = gui_changed_old;
				
				if (count_file_index == 0)
				{
					if (GUILayout.Button("I",GUILayout.Width(25)))
					{
						raw.display_short_list = !raw.display_short_list;
					}
				}
				
				if (GUILayout.Button("Open",GUILayout.Width(55)))
				{
					if (key.control)
					{
						raw.path = String.Empty;
						raw.file_index[count_file_index] = -1;
						script.clean_raw_file_list();
					}
					else
					{
						var raw_file: String;
				       				
					    if (raw.path == String.Empty){raw.path = Application.dataPath;}  
					        				
						if (Application.platform == RuntimePlatform.OSXEditor){raw_file = EditorUtility.OpenFilePanel("Open Heightmap File",raw.path,"raw");}
		        		else {raw_file = EditorUtility.OpenFilePanel("Open Heightmap File",raw.path,"Raw;*.r16;*.raw");}
		        				
					        				
					    if (raw_file.Length != 0)
					    {
					    	raw.file_index[count_file_index] = script.add_raw_file(raw_file);
					     	if (raw.file_index[count_file_index] == -2){this.ShowNotification(GUIContent("Raw file has invalid resolution"));}
					    	if (raw.file_index[count_file_index] > -1)
					    	{
					   			raw.path = raw_file;
					    		script.clean_raw_file_list();
					    		script.raw_files[raw.file_index[count_file_index]].created = false;
					    	}
					    	if (count_file_index == 0){raw.auto_search.path_full = raw_file;}
							EditorGUILayout.EndHorizontal();
					    }
					}
				}
				EditorGUILayout.EndHorizontal();
				
				if (raw.file_foldout[count_file_index])
			    {    			
					if (raw.file_index[count_file_index] > -1)
					{
						EditorGUILayout.BeginHorizontal();
						GUILayout.Space(space+space_list+225);
						EditorGUILayout.LabelField("Resolution",GUILayout.Width(147));
						EditorGUILayout.LabelField(String.Empty+script.raw_files[raw.file_index[count_file_index]].resolution);
						EditorGUILayout.EndHorizontal();
						        			
						EditorGUILayout.BeginHorizontal();
						GUILayout.Space(space+space_list+225);
						EditorGUILayout.LabelField("Byte Order",GUILayout.Width(147));
						script.raw_files[raw.file_index[count_file_index]].mode = EditorGUILayout.EnumPopup(script.raw_files[raw.file_index[count_file_index]].mode,GUILayout.Width(64));
					    EditorGUILayout.EndHorizontal();
					}
				}
			}
		}
		
		EditorGUILayout.BeginHorizontal();
		GUILayout.Space(space+210);
		gui_changed_old = GUI.changed;
		raw.settings_foldout = EditorGUILayout.Foldout(raw.settings_foldout,"Settings");
		GUI.changed = gui_changed_old;
		EditorGUILayout.EndHorizontal();
		
		if (raw.settings_foldout)
		{
			EditorGUILayout.BeginHorizontal();
			GUILayout.Space(space+225);
			EditorGUILayout.LabelField("Flip X",GUILayout.Width(35));
			raw.flip_x = EditorGUILayout.Toggle(raw.flip_x,GUILayout.Width(25));
			EditorGUILayout.LabelField("Flip Y",GUILayout.Width(35));
			raw.flip_y = EditorGUILayout.Toggle(raw.flip_y,GUILayout.Width(25));
			GUILayout.Space(7);
			EditorGUILayout.LabelField("Auto Scale",GUILayout.Width(65));
			raw.raw_auto_scale = EditorGUILayout.Toggle(raw.raw_auto_scale,GUILayout.Width(25));
			EditorGUILayout.EndHorizontal();
			
			EditorGUILayout.BeginHorizontal();
			GUILayout.Space(space+225);
			if (GUILayout.Button("Adjust List",GUILayout.Width(85)))
			{
				raw.adjust_list();
				script.clean_raw_file_list();
			}
			gui_changed_old = GUI.changed;
			GUI.changed = false;
			raw.list_length = EditorGUILayout.IntField(raw.list_length,GUILayout.Width(50));
			if (GUI.changed)
			{
				if (raw.list_length < 1){raw.list_length = 1;}
			}
			GUI.changed = gui_changed_old;
			if (script.settings.tooltip_mode != 0)
        	{
    			tooltip_text = "Auto complete the list\n(Click)\n\nSet search parameters\n(Alt Click)";
	        }
			if (GUILayout.Button(GUIContent("Auto Search<",tooltip_text),GUILayout.Width(95)))
			{
				if (!key.alt)
				{
					Undo.RegisterUndo(script,"Auto Search Raw");
					script.strip_auto_search_file(raw.auto_search);
					script.auto_search_raw(raw);
				}
				else
				{
					raw.auto_search.display = !raw.auto_search.display;
				}
			}
			EditorGUILayout.EndHorizontal();
			
			if (raw.auto_search.display)
			{
				draw_auto_search(raw.auto_search,space);
			}
			
			EditorGUILayout.BeginHorizontal();
			GUILayout.Space(space+225);
			EditorGUILayout.LabelField("Stretch Mode",GUILayout.Width(115));
			raw.raw_mode = EditorGUILayout.EnumPopup(raw.raw_mode,GUILayout.Width(109));
			EditorGUILayout.EndHorizontal();
			
			if (raw.file_index.Count > 1)
			{
				EditorGUILayout.BeginHorizontal();
				GUILayout.Space(space+225);
				EditorGUILayout.LabelField("List Mode",GUILayout.Width(115));
				raw.raw_list_mode = EditorGUILayout.EnumPopup(raw.raw_list_mode,GUILayout.Width(70));
				EditorGUILayout.EndHorizontal();
				
				EditorGUILayout.BeginHorizontal();
				GUILayout.Space(space+225);
				EditorGUILayout.LabelField("Row Length",GUILayout.Width(115));
				raw.list_row = EditorGUILayout.IntField(raw.list_row,GUILayout.Width(70));
				EditorGUILayout.EndHorizontal();
			}
			
			if (!raw.raw_auto_scale)
			{
				EditorGUILayout.BeginHorizontal();
				GUILayout.Space(space+225);
				EditorGUILayout.LabelField("Step X",GUILayout.Width(115));
				raw.conversion_step.x = EditorGUILayout.FloatField(raw.conversion_step.x,GUILayout.Width(70));
				EditorGUILayout.EndHorizontal();
				
				EditorGUILayout.BeginHorizontal();
				GUILayout.Space(space+225);
				EditorGUILayout.LabelField("Step Y",GUILayout.Width(115));
				raw.conversion_step.y = EditorGUILayout.FloatField(raw.conversion_step.y,GUILayout.Width(70));
				EditorGUILayout.EndHorizontal();
			}
			
			gui_changed_old = GUI.changed;
			GUI.changed = false;
			
			EditorGUILayout.BeginHorizontal();
			GUILayout.Space(space+225);
			EditorGUILayout.LabelField("Scale X",GUILayout.Width(115));
			GUILayout.Space(29);
			raw.tile_x = EditorGUILayout.Slider(raw.tile_x,0.001,4);
			EditorGUILayout.EndHorizontal();
										
			EditorGUILayout.BeginHorizontal();
			GUILayout.Space(space+225);
			EditorGUILayout.LabelField("Scale Y",GUILayout.Width(115));
			raw.tile_link = EditorGUILayout.Toggle(raw.tile_link,GUILayout.Width(25));
			raw.tile_y = EditorGUILayout.Slider(raw.tile_y,0.001,4);
			EditorGUILayout.EndHorizontal();
			
			if (GUI.changed)
			{
				gui_changed_old = true;
				if (raw.tile_link){raw.tile_y = raw.tile_x;}
			}
			GUI.changed = gui_changed_old;
			
			EditorGUILayout.BeginHorizontal();
			GUILayout.Space(space+225);
			EditorGUILayout.LabelField("Clamp",GUILayout.Width(115));
			raw.clamp = EditorGUILayout.Toggle(raw.clamp,GUILayout.Width(25));
			EditorGUILayout.EndHorizontal();
			
			EditorGUILayout.BeginHorizontal();
			GUILayout.Space(space+225);
			EditorGUILayout.LabelField("Tile Offset X",GUILayout.Width(115));
			raw.tile_offset_x = EditorGUILayout.Slider(raw.tile_offset_x,-script.terrains[0].size.x,script.terrains[0].size.x);
			EditorGUILayout.EndHorizontal();
		
			EditorGUILayout.BeginHorizontal();
			GUILayout.Space(space+225);
			EditorGUILayout.LabelField("Tile Offset Y",GUILayout.Width(115));
			raw.tile_offset_y = EditorGUILayout.Slider(raw.tile_offset_y,-script.terrains[0].size.z,script.terrains[0].size.z);
			EditorGUILayout.EndHorizontal();
			
			EditorGUILayout.BeginHorizontal();
			GUILayout.Space(space+225);
			EditorGUILayout.LabelField("Rotate",GUILayout.Width(115));
			raw.rotation = EditorGUILayout.Toggle(raw.rotation,GUILayout.Width(25));
			EditorGUILayout.EndHorizontal();
			
			if (raw.rotation)
			{
				EditorGUILayout.BeginHorizontal();
				GUILayout.Space(space+225);
				EditorGUILayout.LabelField("Rotation value",GUILayout.Width(115));
				raw.rotation_value = EditorGUILayout.Slider(raw.rotation_value,-180,180);
				EditorGUILayout.EndHorizontal();
			}
			
			EditorGUILayout.BeginHorizontal();
			GUILayout.Space(space+225);
			EditorGUILayout.EndHorizontal();
		}
	}
	
	function draw_area(prelayer_number: int,prearea: area_class,current_terrain: terrain_class,space: int,world_area: boolean)
	{
		EditorGUILayout.BeginHorizontal();
		GUILayout.Space(30+space);
		var text: String;
		
		if (world_area){text = "World ";} else {text = "Local ";}
		if (script.settings.tooltip_mode > 0)
		{
			if (script.settings.tooltip_mode == 2)
			{
				if (!world_area)
				{
					tooltip_text = "Here you can create the custom (Local) Area output for each terrain";
				}
				else
				{
					tooltip_text = "Here you can create you custom (World) Area output for each terrain";
				}
			}
			else
			{
				tooltip_text = String.Empty;
			}
		}
		gui_changed_old = GUI.changed;
		prearea.foldout = EditorGUILayout.Foldout(prearea.foldout,GUIContent(text+"Area",tooltip_text));
		GUI.changed = gui_changed_old;
		if (world_area)
		{
		    if (!script.settings.toggle_text_no)
		    {
		    	if (script.settings.toggle_text_long){EditorGUILayout.LabelField("Active",GUILayout.Width(40));} else {EditorGUILayout.LabelField("Act",GUILayout.Width(28));}
		    }
		    prearea.active = EditorGUILayout.Toggle(prearea.active,GUILayout.Width(25));
		}
	    EditorGUILayout.EndHorizontal();
	       		
	    if (prearea.foldout)
	    {
			EditorGUILayout.BeginHorizontal();
			GUILayout.Space(45+space);
			var button_text: String;
			
			if (world_area)
			{
				if (script.settings.tooltip_mode != 0)
        		{
    				tooltip_text = "Set Wold Area to Maximum Area\n\nTo calculate the Maximum Area (Shift Click)";
	        	}
				button_text = ">Max";
			} 
			else 
			{
				if (script.settings.tooltip_mode != 0)
        		{
    				tooltip_text = "Set Local Area to Maximum";
    			}
				button_text = "Max";
			}
			
			if (GUILayout.Button(GUIContent(button_text,tooltip_text),GUILayout.Width(45)))
			{
				if (key.shift && world_area){script.calc_area_max(prearea);} else {prearea.max();}
				prearea.set_resolution_mode_text();
			}
			
			if (!world_area)
			{
				
				if (script.settings.tooltip_mode != 0)
        		{
    				tooltip_text = "Set all the Terrain Local Areas the same as "+current_terrain.name;
    			}
				if (script.terrains.Count > 1)
				{
					if (GUILayout.Button(GUIContent("<Set All>",tooltip_text),GUILayout.Width(75)) && key.shift){script.set_all_terrain_area(current_terrain);}
				}
			}
			
			EditorGUILayout.EndHorizontal();
						
		    gui_changed_old = GUI.changed;
		    GUI.changed = false;
		    EditorGUILayout.BeginHorizontal();
			GUILayout.Space(45+space);
			var start_x: float = prearea.area.xMin;
			var end_x: float = prearea.area.xMax;
			EditorGUILayout.LabelField("Area X",GUILayout.Width(120));
			start_x = EditorGUILayout.FloatField(start_x,GUILayout.Width(55));
			GUILayout.Space(19);
			EditorGUILayout.MinMaxSlider(start_x,end_x,prearea.area_max.x,prearea.area_max.xMax,GUILayout.Width(180)); 
			GUILayout.Space(19);
			end_x = EditorGUILayout.FloatField(end_x,GUILayout.Width(55));
		    if (GUI.changed)
		    {
		    	if (start_x < prearea.area_max.xMin){start_x = prearea.area_max.xMin;}
		    	if (start_x > prearea.area_max.xMax){start_x = prearea.area_max.xMax;}
		    	if (end_x < prearea.area_max.xMin){end_x = prearea.area_max.xMin;}
		    	if (end_x > prearea.area_max.xMax){end_x = prearea.area_max.xMax;}
		    	if (end_x < start_x){end_x = start_x;}
		    	prearea.set_resolution_mode_text();
		    }
		    prearea.area.xMin = start_x;
		    prearea.area.xMax = end_x;
		   	EditorGUILayout.EndHorizontal();
		    
		    GUI.changed = false;  		
		   	EditorGUILayout.BeginHorizontal();
			GUILayout.Space(45+space);
			var start_y: float = prearea.area.yMin;
			var end_y: float = prearea.area.yMax;
			EditorGUILayout.LabelField("Area Z",GUILayout.Width(120));
			start_y = EditorGUILayout.FloatField(start_y,GUILayout.Width(55));
			prearea.link_start = EditorGUILayout.Toggle(prearea.link_start,GUILayout.Width(15));
			EditorGUILayout.MinMaxSlider(start_y,end_y,prearea.area_max.y,prearea.area_max.yMax,GUILayout.Width(180)); 
		    prearea.link_end = EditorGUILayout.Toggle(prearea.link_end,GUILayout.Width(15));
		    end_y = EditorGUILayout.FloatField(end_y,GUILayout.Width(55));
		    if (prearea.link_start){start_y = start_x;if (start_y > end_y){end_y = start_y;}}
		    if (prearea.link_end){end_y = end_x;if(end_y < start_y){start_y = end_y;}}
		    if (GUI.changed)
		    {
		    	if (start_y < prearea.area_max.yMin){start_y = prearea.area_max.yMin;}
		    	if (start_y > prearea.area_max.yMax){start_y = prearea.area_max.yMax;}
		    	if (end_y < prearea.area_max.yMin){end_y = prearea.area_max.yMin;}
		    	if (end_y > prearea.area_max.yMax){end_y = prearea.area_max.yMax;}
		    	if (end_y < start_y){end_y = start_y;}
		    }
		    
			prearea.area.yMin = start_y;
		    prearea.area.yMax = end_y;
		    EditorGUILayout.EndHorizontal();
		    GUI.changed = gui_changed_old;
		    
		    EditorGUILayout.BeginHorizontal();
			GUILayout.Space(45+space);
			EditorGUILayout.LabelField("Tree Resolution",GUILayout.Width(120));
			gui_changed_old = GUI.changed;
			GUI.changed = false;
			prearea.tree_resolution = EditorGUILayout.IntField(prearea.tree_resolution,GUILayout.Width(55));	
			if (GUI.changed)
			{
				if (prearea.tree_resolution < 8){prearea.tree_resolution = 8;}
			}
			GUI.changed = gui_changed_old;
			prearea.tree_resolution_active = EditorGUILayout.Toggle(prearea.tree_resolution_active,GUILayout.Width(25));
			EditorGUILayout.EndHorizontal();
			
			EditorGUILayout.BeginHorizontal();
			GUILayout.Space(45+space);
			EditorGUILayout.LabelField("Object Resolution",GUILayout.Width(120));
			gui_changed_old = GUI.changed;
			GUI.changed = false;
			prearea.object_resolution = EditorGUILayout.IntField(prearea.object_resolution,GUILayout.Width(55));	
			if (GUI.changed)
			{
				if (prearea.object_resolution < 8){prearea.object_resolution = 8;}	
			}
			GUI.changed = gui_changed_old;
			prearea.object_resolution_active = EditorGUILayout.Toggle(prearea.object_resolution_active,GUILayout.Width(25));
			EditorGUILayout.EndHorizontal();
		    
			if (world_area)
			{
				EditorGUILayout.BeginHorizontal();
				GUILayout.Space(45+space);
				EditorGUILayout.LabelField("Maximum Area");
				EditorGUILayout.EndHorizontal();
				
				gui_changed_old = GUI.changed;
				GUI.changed = false;
				EditorGUILayout.BeginHorizontal();
				GUILayout.Space(45+space);
				EditorGUILayout.LabelField("X min",GUILayout.Width(120));
				prearea.area_max.xMin = EditorGUILayout.FloatField(prearea.area_max.xMin,GUILayout.Width(100));
				EditorGUILayout.LabelField("X max",GUILayout.Width(120));
				prearea.area_max.xMax = EditorGUILayout.FloatField(prearea.area_max.xMax,GUILayout.Width(100));
				EditorGUILayout.EndHorizontal();
				
				EditorGUILayout.BeginHorizontal();
				GUILayout.Space(45+space);
				EditorGUILayout.LabelField("Z min",GUILayout.Width(120));
				prearea.area_max.yMin = EditorGUILayout.FloatField(prearea.area_max.yMin,GUILayout.Width(100));
				EditorGUILayout.LabelField("Z max",GUILayout.Width(120));
				prearea.area_max.yMax = EditorGUILayout.FloatField(prearea.area_max.yMax,GUILayout.Width(100));
				EditorGUILayout.EndHorizontal();
				GUI.changed = gui_changed_old;
			}
			
			EditorGUILayout.BeginHorizontal();
			GUILayout.Space(45+space);
			EditorGUILayout.LabelField("Mode",GUILayout.Width(120));
			GUI.changed = gui_changed_old;
			GUI.changed = false;
			prearea.resolution_mode = EditorGUILayout.EnumPopup(prearea.resolution_mode,GUILayout.Width(80));
			if (GUI.changed){script.set_area_resolution(current_terrain,prearea);prearea.set_resolution_mode_text();}
			EditorGUILayout.EndHorizontal();
			
		    if (prearea.resolution_mode != resolution_mode_enum.Automatic)
		    {			
				if (prearea.resolution_mode == resolution_mode_enum.Custom)
				{
					EditorGUILayout.BeginHorizontal();
					GUILayout.Space(45+space);
				 	EditorGUILayout.LabelField("Resolution",GUILayout.Width(120));
				 	gui_changed_old = GUI.changed;
				 	GUI.changed = false;
					prearea.custom_resolution = EditorGUILayout.FloatField(prearea.custom_resolution,GUILayout.Width(80));
					if (GUI.changed)
					{
						if (prearea.custom_resolution < 1){prearea.custom_resolution = 1;}
						prearea.step.x = script.terrains[0].size.x/prearea.custom_resolution;
						prearea.step.y = prearea.step.x;
					}
					GUI.changed = gui_changed_old;
					EditorGUILayout.EndHorizontal();
				}
				else
				{
					EditorGUILayout.BeginHorizontal();
					GUILayout.Space(45+space);
				 	EditorGUILayout.LabelField("Resolution",GUILayout.Width(120));
				 	EditorGUILayout.LabelField(String.Empty+prearea.resolution);
					EditorGUILayout.EndHorizontal();
				}
				
				EditorGUILayout.BeginHorizontal();
				GUILayout.Space(45+space);
				if (prearea.resolution_mode == resolution_mode_enum.Custom)
				{
					GUI.changed = false;
					prearea.step = EditorGUILayout.Vector2Field("Step",prearea.step);
					if (GUI.changed)
					{
						if (prearea.step.x <= 0){prearea.step.x = 1;}
						if (prearea.step.y <= 0){prearea.step.y = 1;}
					}
				}
				else {EditorGUILayout.Vector2Field("Step",prearea.step);}
				EditorGUILayout.EndHorizontal();
			}
			GUI.changed = gui_changed_old;
		}
	}
	
	function draw_precolor_range(precolor_range: precolor_range_class,space: int,one_color: boolean, minimum: int,color_color_range1: Color,display_swap: boolean,display_value: boolean,erase_button: boolean,call_from: int)
	{
 		if (!script){return;}
 		if (script.settings.color_scheme){GUI.color = color_color_range1;}
 		
 		EditorGUILayout.BeginHorizontal();
		GUILayout.Space(space);
		gui_changed_old = GUI.changed;
		precolor_range.foldout = EditorGUILayout.Foldout(precolor_range.foldout,precolor_range.text);
		GUI.changed = gui_changed_old;
		if (erase_button)
		{
			if (GUILayout.Button("-",GUILayout.Width(25)) && key.control)
			{
				Undo.RegisterUndo(script,"ColorGroup Erase");
				current_layer.color_output.erase_precolor_range(precolor_range.index-1);
				if (script.generate_auto){generate_auto();}
				this.Repaint();
		        return;
			}
		}
		EditorGUILayout.EndHorizontal();
		
		if (precolor_range.foldout)
		{
			EditorGUILayout.BeginHorizontal();
			GUILayout.Space(space+15);
			if (GUILayout.Button("+",GUILayout.Width(25)))
			{
				add_color_range(precolor_range.color_range.Count-1,precolor_range,one_color,true);
				if (script.generate_auto)
				{
					if (call_from != 4 && call_from != 5){generate_auto();}
				}
			}
			if (GUILayout.Button("-",GUILayout.Width(25)) && precolor_range.color_range.Count > minimum && key.control)
			{
				if (!key.shift)
	        	{
	        		Undo.RegisterUndo(script,"Erase Color");
	        		erase_color_range(precolor_range.color_range.Count-1,precolor_range);
	        	}
				else 
				{
					Undo.RegisterUndo(script,"Erase Colors");
	        		precolor_range.clear_color_range();
				}
				
				if (script.generate_auto)
				{
					if (call_from != 4 && call_from != 5){generate_auto();}
				}
			}
			if (script.settings.tooltip_mode != 0)
        	{
        		tooltip_text = "Detect the colors in the image automatically\n\n(Shift Click)";
        	}
        	if (call_from == 1 || call_from == 2)
        	{
				if (GUILayout.Button(GUIContent("<Detect>",tooltip_text),GUILayout.Width(75)) && key.shift)
			    {
			    	
			    	Undo.RegisterUndo(script,"Detect Colors");
	        		/*
	        		if (precolor_range.color_range.Count < 3)
			        {
			        	if (precolor_range.color_range.Count == 0){add_color_range(precolor_range.color_range.Count-1,precolor_range,one_color,false);}
			        	for (var count: int = 0;count < 4-precolor_range.color_range.Count;++count)
			        	{
			        		add_color_range(precolor_range.color_range.Count-1,precolor_range,one_color,false);
			        	}
			        }
			        precolor_range.color_range[0].color_start = Color.red; 
			        precolor_range.color_range[1].color_start = Color.green; 
			        precolor_range.color_range[2].color_start = Color.blue; 
			    	precolor_range.set_precolor_range_curve();
			    	*/
			    	precolor_range.detect_colors_image(current_preimage.image[0]);
			    }
			    
			    gui_changed_old = GUI.changed;
			    GUI.changed = false;
			    precolor_range.detect_max = EditorGUILayout.IntField(precolor_range.detect_max,GUILayout.Width(30));
			    if (GUI.changed)
			    {
			    	if (precolor_range.detect_max < 1){precolor_range.detect_max = 1;}
			    	if (precolor_range.detect_max > 100){precolor_range.detect_max = 100;}
			    }
			    GUI.changed = gui_changed_old;
			}
		    if (!script.settings.toggle_text_no)
	        {
	        	if (script.settings.toggle_text_long){EditorGUILayout.LabelField("Palette",GUILayout.Width(50));} else {EditorGUILayout.LabelField("Pal",GUILayout.Width(28));}
	        }  
		     
		    precolor_range.palette = EditorGUILayout.Toggle(precolor_range.palette,GUILayout.Width(15));
			
			var button_menu: boolean = GUILayout.Button("Menu",GUILayout.Width(55));
	    
		    if (key.type == EventType.Repaint) 
			{
	        	precolor_range.menu_rect = GUILayoutUtility.GetLastRect();
	        }
	         	
		    if (button_menu)
	        {
	        	var menu: GenericMenu;
	        	var userdata: menu_arguments_class[] = new menu_arguments_class[3];
	        	 		
	        	userdata[0] = new menu_arguments_class();
	        	userdata[0].name = "new";
	        	userdata[1] = new menu_arguments_class();
	        	userdata[1].name = "open";
	        	userdata[2] = new menu_arguments_class();
	        	userdata[2].name = "save";
	        	 		
	        	menu = new GenericMenu ();                                
	        	menu.AddItem(new GUIContent("New"),false,precolor_menu,userdata[0]);                
	        	menu.AddSeparator (""); 
	        	menu.AddItem(new GUIContent("Open"),false,precolor_menu,userdata[1]);                
	        	               
	        	menu.AddItem(new GUIContent("Save"),false,precolor_menu,userdata[2]);                                
	        	 		
	        	current_precolor_range = precolor_range;		
	        	menu.DropDown (precolor_range.menu_rect);
	        }
			
			if (GUILayout.Button("A",GUILayout.Width(20)))
			{
				precolor_range.color_ranges_active = !precolor_range.color_ranges_active;
				script.change_color_ranges_active(precolor_range,key.shift);
			}	
			if (GUILayout.Button("I",GUILayout.Width(20)))
			{
				precolor_range.interface_display = !precolor_range.interface_display;
			}
			
			if (call_from == 3)
			{
				if (GUILayout.Button(">Set All",GUILayout.Width(65)))
				{
					script.set_all_tree_precolor_range(current_layer.tree_output,current_tree_number,key.shift);	
					if (script.generate_auto){generate_auto();}	
				}
			}
		
			EditorGUILayout.EndHorizontal();
			
			if (call_from == 1)
			{
				if (current_layer.output != layer_output_enum.heightmap)
				{
					EditorGUILayout.BeginHorizontal();
					GUILayout.Space(space+15);
					EditorGUILayout.LabelField("Mode",GUILayout.Width(55));
					current_preimage.select_mode = EditorGUILayout.EnumPopup(current_preimage.select_mode,GUILayout.Width(109));
					EditorGUILayout.EndHorizontal();
				}
			}
									
		    if (precolor_range.palette)
		    {
		    	EditorGUILayout.BeginHorizontal();
		        GUILayout.Space(space+15);
		        var color_old: Color = GUI.color;
		        GUI.color = Color.white;
		        GUILayout.Button(palette_texture,"");	 
		        GUI.color = color_old;
		    	EditorGUILayout.EndHorizontal();
		    }
		     
		    if (precolor_range.color_range.Count > 0)
			{
				for (var count_color_range1: int = 0;count_color_range1 < precolor_range.color_range.Count;++count_color_range1)
				{
					color_color_range = color_color_range1;
					
					if (!precolor_range.color_range_value.active[count_color_range1]){color_color_range += Color(-0.2,-0.2,-0.2,0);}
				
			        if (precolor_range.color_range[count_color_range1].color_color_range != color_color_range)
				    {
				    	if (precolor_range.color_range[count_color_range1].color_color_range[0] > color_color_range[0]){precolor_range.color_range[count_color_range1].color_color_range[0] -= 0.004;} 
				        	else if (precolor_range.color_range[count_color_range1].color_color_range[0]+0.01 < color_color_range[0]){precolor_range.color_range[count_color_range1].color_color_range[0] += 0.004;}	
				        		else {precolor_range.color_range[count_color_range1].color_color_range[0] = color_color_range[0];}
				        if (precolor_range.color_range[count_color_range1].color_color_range[1] > color_color_range[1]){precolor_range.color_range[count_color_range1].color_color_range[1] -= 0.004;} 
				        	else if (precolor_range.color_range[count_color_range1].color_color_range[1]+0.01 < color_color_range[1]){precolor_range.color_range[count_color_range1].color_color_range[1] += 0.004;}
				           		else {precolor_range.color_range[count_color_range1].color_color_range[1] = color_color_range[1];}
						if (precolor_range.color_range[count_color_range1].color_color_range[2] > color_color_range[2]){precolor_range.color_range[count_color_range1].color_color_range[2] -= 0.004;} 
							else if (precolor_range.color_range[count_color_range1].color_color_range[2]+0.01 < color_color_range[2]){precolor_range.color_range[count_color_range1].color_color_range[2] += 0.004;}
								else {precolor_range.color_range[count_color_range1].color_color_range[2] = color_color_range[2];}
						if (precolor_range.color_range[count_color_range1].color_color_range[3] > color_color_range[3]){precolor_range.color_range[count_color_range1].color_color_range[3] -= 0.004;} 
							else if (precolor_range.color_range[count_color_range1].color_color_range[3]+0.01 < color_color_range[3]){precolor_range.color_range[count_color_range1].color_color_range[3] += 0.004;}
								else {precolor_range.color_range[count_color_range1].color_color_range[3] = color_color_range[3];}
				        this.Repaint();
				        if (texture_tool){texture_tool.Repaint();}
					}
			    	if (script.settings.color_scheme){GUI.color = precolor_range.color_range[count_color_range1].color_color_range;} else {GUI.color = Color.white;}
			    	
					EditorGUILayout.BeginHorizontal();
					GUILayout.Space(space+15);
					
					// color range text
					EditorGUILayout.LabelField("Color"+count_color_range1,GUILayout.Width(55));
					
					var color_old1: Color = precolor_range.color_range[count_color_range1].color_start;
					precolor_range.color_range[count_color_range1].color_start = EditorGUILayout.ColorField(precolor_range.color_range[count_color_range1].color_start);
					if (color_old1 != precolor_range.color_range[count_color_range1].color_start){precolor_range.set_precolor_range_curve();}
					
					if (!precolor_range.color_range[count_color_range1].one_color)
					{
						precolor_range.color_range[count_color_range1].color_end = EditorGUILayout.ColorField(precolor_range.color_range[count_color_range1].color_end);
						
						if (call_from != 1 || current_preimage.select_mode != select_mode_enum.select)
						{
							gui_changed_old = GUI.changed;
							GUI.changed = false;
							precolor_range.color_range[count_color_range1].precurve.curve = EditorGUILayout.CurveField(precolor_range.color_range[count_color_range1].precurve.curve,GUILayout.Width(30));
							if (GUI.changed)
							{
								gui_changed_old = true;
								precolor_range.color_range[count_color_range1].output = precolor_range.color_range[count_color_range1].precurve.curve.Evaluate(1);
							}
							GUI.changed = gui_changed_old;																														
							if (GUILayout.Button(precolor_range.color_range[count_color_range1].precurve.curve_text,GUILayout.Width(63)))
							{
								if (key.control && !key.shift)
								{
									Undo.RegisterUndo(script,"Default Curve");
									precolor_range.color_range[count_color_range1].precurve.set_default();
									if (script.generate_auto){generate_auto();}
								}
								else if (key.alt)
								{
									if (key.shift)
									{
										script.loop_prelayer("(sad)",0,true);
									}
								}
								else
								{
									curve_menu_button(precolor_range.color_range[count_color_range1].precurve,script.get_output_length(current_layer),precolor_range.color_range[count_color_range1].curve_menu_rect);
								}
							}
							if (key.type == EventType.Repaint){precolor_range.color_range[count_color_range1].curve_menu_rect = GUILayoutUtility.GetLastRect();}
						}
					} 
					else if (!one_color)
					{
						if (call_from != 1 || current_preimage.select_mode != select_mode_enum.select)
						{
							gui_changed_old = GUI.changed;
							GUI.changed = false;
							precolor_range.color_range[count_color_range1].output = EditorGUILayout.FloatField(precolor_range.color_range[count_color_range1].output,GUILayout.Width(55));
							if (GUI.changed)
							{
								gui_changed_old = true;
								precolor_range.color_range[count_color_range1].precurve.change_key(1,precolor_range.color_range[count_color_range1].output);
							}
							GUI.changed = gui_changed_old;
						}
					}
					
					if (call_from == 1)
					{
						if (current_preimage.select_mode == select_mode_enum.select)
						{
							precolor_range.color_range[count_color_range1].select_output = EditorGUILayout.IntField(precolor_range.color_range[count_color_range1].select_output,GUILayout.Width(25));
							if (GUILayout.Button("+",GUILayout.Width(25)))
							{
								if (!key.shift)
								{
									++precolor_range.color_range[count_color_range1].select_output;
								}
								else
								{
									if (count_color_range1 > 1){precolor_range.color_range[count_color_range1].select_output = precolor_range.color_range[count_color_range1-1].select_output+1;}
									else 
									{
										++precolor_range.color_range[count_color_range1].select_output;
									}
								}
								
								if (script.generate_auto){generate_auto();}
							}
							if (GUILayout.Button("-",GUILayout.Width(25)))
							{
								--precolor_range.color_range[count_color_range1].select_output;
								if (script.generate_auto){generate_auto();}
							}
							
							if (precolor_range.color_range[count_color_range1].select_output < 0){precolor_range.color_range[count_color_range1].select_output = 0;}
							
							switch (current_layer.output)
							{
								case layer_output_enum.color:
									if (precolor_range.color_range[count_color_range1].select_output > current_layer.color_output.precolor_range[current_filter.color_output_index].color_range.Count-1 && precolor_range.color_range[count_color_range1].select_output != 0){precolor_range.color_range[count_color_range1].select_output = current_layer.color_output.precolor_range[current_filter.color_output_index].color_range.Count-1;}
									break;
								case layer_output_enum.splat:
									if (precolor_range.color_range[count_color_range1].select_output > current_layer.splat_output.splat.Count-1 && precolor_range.color_range[count_color_range1].select_output != 0){precolor_range.color_range[count_color_range1].select_output = current_layer.splat_output.splat.Count-1;}
									break;
								case layer_output_enum.tree:
									if (precolor_range.color_range[count_color_range1].select_output > current_layer.tree_output.tree.Count-1 && precolor_range.color_range[count_color_range1].select_output != 0){precolor_range.color_range[count_color_range1].select_output = current_layer.tree_output.tree.Count-1;}
									break;
								case layer_output_enum.grass:
									if (precolor_range.color_range[count_color_range1].select_output > current_layer.grass_output.grass.Count-1 && precolor_range.color_range[count_color_range1].select_output != 0){precolor_range.color_range[count_color_range1].select_output = current_layer.grass_output.grass.Count-1;}
									break;
								case layer_output_enum.object:
									if (precolor_range.color_range[count_color_range1].select_output > current_layer.object_output.object.Count-1 && precolor_range.color_range[count_color_range1].select_output != 0){precolor_range.color_range[count_color_range1].select_output = current_layer.object_output.object.Count-1;}
									break;
							}
						}
					}
					
					if (!script.settings.toggle_text_no)
					{
						if (script.settings.toggle_text_long){EditorGUILayout.LabelField("Invert",GUILayout.Width(40));} else {EditorGUILayout.LabelField("Inv",GUILayout.Width(28));}
					}
					gui_changed_old = GUI.changed;
					GUI.changed = false;
					precolor_range.color_range[count_color_range1].invert = EditorGUILayout.Toggle(precolor_range.color_range[count_color_range1].invert,GUILayout.Width(25));
					if (GUI.changed)
					{
						gui_changed_old = true;
						if (key.shift)
						{
							precolor_range.color_range[count_color_range1].invert = !precolor_range.color_range[count_color_range1].invert;
							precolor_range.invert_color_range(count_color_range1);
						}
					}
					GUI.changed = gui_changed_old;
					if (display_value)
					{
						gui_changed_old = GUI.changed;
			           	GUI.changed = false;
						precolor_range.color_range_value.value[count_color_range1] = EditorGUILayout.Slider(precolor_range.color_range_value.value[count_color_range1],1,100);
						if (script.settings.tooltip_mode != 0)
						{
							tooltip_text = "Center this value to 50";
						}
						if (GUILayout.Button(GUIContent("C",tooltip_text),GUILayout.Width(25))){precolor_range.color_range_value.value[count_color_range1] = 50;GUI.changed = true;}
						EditorGUILayout.LabelField(precolor_range.color_range_value.text[count_color_range1],GUILayout.Width(90));
						if (GUI.changed)
						{
							gui_changed_old = true;
							precolor_range.color_range_value.calc_value();
						}
						GUI.changed = gui_changed_old;
					}
					
					if (!script.settings.toggle_text_no && !one_color)
					{
						if (script.settings.toggle_text_long){EditorGUILayout.LabelField("One Color",GUILayout.Width(65));} else {EditorGUILayout.LabelField("One",GUILayout.Width(28));}
					}
					if (!one_color){precolor_range.color_range[count_color_range1].one_color = EditorGUILayout.Toggle(precolor_range.color_range[count_color_range1].one_color,GUILayout.Width(25));}
					
					if (!script.settings.toggle_text_no)
	        		{
	        			if (script.settings.toggle_text_long){EditorGUILayout.LabelField("Active",GUILayout.Width(40));} else {EditorGUILayout.LabelField("Act",GUILayout.Width(28));}
	        		}
	        		gui_changed_old = GUI.changed;
	        		GUI.changed = false;
					precolor_range.color_range_value.active[count_color_range1] = EditorGUILayout.Toggle(precolor_range.color_range_value.active[count_color_range1],GUILayout.Width(25));
	        		if (GUI.changed)
					{
						gui_changed_old = true;
						precolor_range.color_range_value.calc_value();
					}
					GUI.changed = gui_changed_old;
	        		
	        		if (precolor_range.interface_display)
	        		{
						if (GUILayout.Button("<",GUILayout.Width(25)) && count_color_range1 > 0)
			            {
			           		precolor_range.swap_color(count_color_range1,count_color_range1-1);           			  	
			           		if (script.generate_auto)
							{
								if (call_from != 4 && call_from != 5){generate_auto();}
							}
			           	} 		 
			           	if (display_swap)
			           	{
				           	if (GUILayout.Button(precolor_range.color_range[count_color_range1].swap_text,GUILayout.Width(35)))
				           	{
				           		swap_color_range(precolor_range.color_range[count_color_range1],count_color_range1,precolor_range);	
				           		if (!script.swap_color_range_select)
				           		{
				           			this.Repaint();
				           			if (texture_tool){texture_tool.Repaint();}
				           		}
				           		if (script.generate_auto){generate_auto();}
				           	}
			           	} 		 
			           	if (GUILayout.Button(">",GUILayout.Width(25)) && count_color_range1 < precolor_range.color_range.Count-1)
			           	{
			           		precolor_range.swap_color(count_color_range1,count_color_range1+1);
			           		if (script.generate_auto)
							{
								if (call_from != 4 && call_from != 5){generate_auto();}
							}
			           	} 
						
						if (GUILayout.Button("+",GUILayout.Width(25)))
						{
							add_color_range(count_color_range1,precolor_range,one_color,true);
							if (script.generate_auto)
							{
								if (call_from != 4 && call_from != 5){generate_auto();}
							}
						}
						if (GUILayout.Button("-",GUILayout.Width(25)) && key.control && precolor_range.color_range.Count > minimum)
						{
							erase_color_range(count_color_range1,precolor_range);
							
							if (script.generate_auto)
							{
								if (call_from != 4 && call_from != 5){generate_auto();}
							}
							return;
						}
					}
					EditorGUILayout.EndHorizontal();
				}
			}	
			if (script.settings.display_color_curves && one_color)
			{
				EditorGUILayout.BeginHorizontal();
			    GUILayout.Space(space+15);
				EditorGUILayout.LabelField("Red",GUILayout.Width(55));
			    EditorGUILayout.CurveField(precolor_range.curve_red);
			    EditorGUILayout.EndHorizontal();
			    EditorGUILayout.BeginHorizontal();
			    GUILayout.Space(space+15);
			    EditorGUILayout.LabelField("Green",GUILayout.Width(55));
			    EditorGUILayout.CurveField(precolor_range.curve_green);
			    EditorGUILayout.EndHorizontal();
			    EditorGUILayout.BeginHorizontal();
			    GUILayout.Space(space+15);
			    EditorGUILayout.LabelField("Blue",GUILayout.Width(55));
			    EditorGUILayout.CurveField(precolor_range.curve_blue);
			    EditorGUILayout.EndHorizontal();
			}
		}		
		if (script.settings.color_scheme){GUI.color = color_color_range1;}
	 }
	 
	// description functions
	function add_description(prelayer: prelayer_class,description_number: int)
	{
		prelayer.predescription.add_description(description_number+1);
		
		if (key.shift)
		{
			script.copy_description(prelayer,description_number,prelayer,description_number+1);
		}
		else if (key.alt && script.copy_description_select)
		{
			script.search_description_copy();
			script.copy_description(script.prelayers[script.copy_description_prelayer_index],script.copy_description_position,prelayer,description_number+1);
		}
		else
		{
			prelayer.predescription.description[description_number+1].text = "(Description here)";
			prelayer.predescription.description[description_number+1].edit = true;
		}
		prelayer.predescription.set_description_enum();
	}
	
	function erase_description(prelayer: prelayer_class,count_description: int)
	{
		Undo.RegisterUndo(script,"LayerGroup Erase");
	    script.erase_description(prelayer,count_description);
	}
	 
	// layer_functions
	function add_layer(prelayer: prelayer_class,layer_number: int,description_position: int,layer_index: int)
	{
	    if (key.shift && layer_number > -1)
	    {
	    	script.add_layer(prelayer,layer_number+1,prelayer.layer_output,description_position,layer_index,false,false);
	    	prelayer.layer[layer_number+1] = script.copy_layer(prelayer.layer[layer_number],true,true);
	    	script.loop_layer_copy(prelayer.layer[layer_number+1]);
	    	script.count_layers();
	    }
	    else if (key.alt && script.copy_layer_select)
	    {
	    	script.add_layer(prelayer,layer_number+1,prelayer.layer_output,description_position,layer_index,false,false);
			script.search_layer_copy();
			prelayer.layer[layer_number+1] = script.copy_layer(script.prelayers[script.copy_prelayer_index].layer[script.copy_layer_index],true,true);
			script.loop_layer_copy(prelayer.layer[layer_number+1]);
			script.count_layers();
		}
	    else
	    {
	    	script.add_layer(prelayer,layer_number+1,prelayer.layer_output,description_position,layer_index,true,true);
	    }
	}
	
	function erase_layer(prelayer: prelayer_class,layer_number: int,description_index: int,layer_index: int)
	{
	    Undo.RegisterUndo(script,"Layer Erase");
	    script.erase_layer(prelayer,layer_number,description_index,layer_index,true,true,true);
	}
	
	function swap_layer(layer: layer_class,layer_number: int,prelayer: prelayer_class)
	{
		if (!key.alt)
		{		           	   	
			if (!script.swap_layer_select)
		    {
		    	layer.swap_text = layer.swap_text.Replace("S","?");
		        layer.swap_select = true;
		        script.swap_layer_select = true;
		    } 
		    else
		    {
		    	script.search_layer_swap();
		    	if (prelayer.index == script.swap_prelayer_index)
		        {
			       	script.swap_layer(prelayer,layer_number,script.prelayers[script.swap_prelayer_index],script.swap_layer_index);
			       	prelayer.layer[layer_number].swap_text = prelayer.layer[layer_number].swap_text.Replace("?","S");
			       	prelayer.layer[layer_number].swap_select = false;
			       	script.swap_layer_select = false;
		        }
		        else
		        {
		         	this.ShowNotification(GUIContent("Swapping not allowed!"));
		        }
		     }
		 }
		 else
		 {
		 	if (script.copy_layer_select)
		    {
		    	script.search_layer_copy();
		    	script.prelayers[script.copy_prelayer_index].layer[script.copy_layer_index].swap_text = script.prelayers[script.copy_prelayer_index].layer[script.copy_layer_index].swap_text.Replace("*","");
		    	script.prelayers[script.copy_prelayer_index].layer[script.copy_layer_index].copy_select = false;
		    }
		    script.copy_layer_select = true;
		    layer.copy_select = true;
		    layer.swap_text = layer.swap_text.Insert(0,"*")+"*";
		 }
	}
	
	// filter_functions
	function add_filter(filter_number: int,prelayer: prelayer_class,prefilter: prefilter_class)
	{
		script.add_filter(filter_number+1,prefilter);
		if (prelayer.index > 0){script.filter[script.filter.Count-1].preimage.image_auto_scale = false;}
		if (key.shift && filter_number > -1)
		{
			script.filter[script.filter.Count-1] = script.copy_filter(script.filter[prefilter.filter_index[filter_number]],true);
			script.filter[prefilter.filter_index[filter_number+1]] = script.filter[script.filter.Count-1];
		}
		if (key.alt && script.copy_filter_select)
		{
			var filter_position: int = script.search_filter_copy();
			script.filter[script.filter.Count-1] = script.copy_filter(script.filter[filter_position],true);
			script.filter[prefilter.filter_index[filter_number+1]] = script.filter[script.filter.Count-1];
		}
	} 	
	
	function erase_filter(filter_number: int,prefilter: prefilter_class)
	{
		Undo.RegisterUndo(script,"Filter Erase");
		script.erase_filter(filter_number,prefilter);
	}
	
	function swap_filter(filter: filter_class,filter_index: int,prefilter: prefilter_class)
	{
	  	var filter_position: int;
	  	if (!key.alt)
	  	{
		   	if (!script.swap_filter_select)
		   	{
		   		filter.swap_select = true;
		   		script.swap_filter_select = true;
		   		filter.swap_text = filter.swap_text.Replace("S","?");
		   	} 
		   	else
		   	{
		   		filter_position = script.search_filter_swap();
		   		script.filter[filter_position].swap_text = script.filter[filter_position].swap_text.Replace("?","S");
		        script.filter[filter_position].swap_select = false;
		    	script.swap_filter_select = false;
		        script.swap_filter2(prefilter.filter_index[filter_index],filter_position,true);
		        if (script.generate_auto){generate_auto();}
		    }
		 }
		 else
		 {
		 	if (script.copy_filter_select)
		    {
		    	filter_position = script.search_filter_copy();
		    	script.filter[filter_position].swap_text = script.filter[filter_position].swap_text.Replace("*","");
				script.filter[filter_position].copy_select = false;		    	
		    }
		    script.copy_filter_select = true;
		    filter.copy_select = true;
		    filter.swap_text = filter.swap_text.Insert(0,"*")+"*";
		 }     
	}
	
	function swap_description(prelayer: prelayer_class,description: description_class,description_number: int)
	{
		if (!key.alt)
		{
			if (!script.swap_description_select)
			{
				description.swap_select = true;
				script.swap_description_select = true;
				description.swap_text = description.swap_text.Replace("S","?");
			}
			else
			{
				script.search_description_swap();
				if (prelayer.index != script.swap_description_prelayer_index){this.ShowNotification(GUIContent("Swapping not allowed!"));return;}
				script.prelayers[script.swap_description_prelayer_index].predescription.description[script.swap_description_position].swap_text = script.prelayers[script.swap_description_prelayer_index].predescription.description[script.swap_description_position].swap_text.Replace("?","S");
				script.prelayers[script.swap_description_prelayer_index].predescription.description[script.swap_description_position].swap_select = false;
				script.swap_description_select = false;
				if (description_number != script.swap_description_position){script.swap_description(script.swap_description_position,description_number,prelayer);}
			}
		}
		else
		{
			if (script.copy_description_select)
			{
				script.search_description_copy();
				script.prelayers[script.copy_description_prelayer_index].predescription.description[script.copy_description_position].swap_text = script.prelayers[script.copy_description_prelayer_index].predescription.description[script.copy_description_position].swap_text.Replace("*","");
				script.prelayers[script.copy_description_prelayer_index].predescription.description[script.copy_description_position].copy_select = false;				
			}
			script.copy_description_select = true;
		 	description.copy_select = true;
		 	description.swap_text = description.swap_text.Insert(0,"*")+"*";
		}
	}
	// subfilter_functions
	function add_subfilter(subfilter_number: int,prelayer: prelayer_class,presubfilter: presubfilter_class)
	{
		script.add_subfilter(subfilter_number+1,presubfilter);
		
		// auto place > 0 on output -> min
		if (subfilter_number+1 > 0){script.subfilter[script.subfilter.Count-1].output = subfilter_output_enum.min;}
		
		if (prelayer.index > 0){script.subfilter[script.subfilter.Count-1].preimage.image_auto_scale = false;}
		if (key.shift && subfilter_number > -1)
		{
			script.subfilter[script.subfilter.Count-1] = script.copy_subfilter(script.subfilter[presubfilter.subfilter_index[subfilter_number]]);
			script.subfilter[presubfilter.subfilter_index[subfilter_number+1]] = script.subfilter[script.subfilter.Count-1];
		}
		if (key.alt && script.copy_subfilter_select)
		{
			var subfilter_position: int = script.search_subfilter_copy();
			script.subfilter[script.subfilter.Count-1] = script.copy_subfilter(script.subfilter[subfilter_position]);
			script.subfilter[current_filter.presubfilter.subfilter_index[subfilter_number+1]] = script.subfilter[script.subfilter.Count-1];
		}
	}
	
	function erase_subfilter(subfilter_number: int,presubfilter: presubfilter_class)
	{
		Undo.RegisterUndo(script,"Subfilter Erase");
		script.erase_subfilter(subfilter_number,presubfilter);
	}	
	
	function swap_subfilter(subfilter: subfilter_class,subfilter_number: int,presubfilter: presubfilter_class)
	{
		var subfilter_position: int;
		if (!key.alt)
		{
			if (!script.swap_subfilter_select)
			{
				script.swap_subfilter_select = true;
				subfilter.swap_select = true;
				subfilter.swap_text = subfilter.swap_text.Replace("S","?");
			} 
			else
			{
				subfilter_position = script.search_subfilter_swap();
				script.subfilter[subfilter_position].swap_text = script.subfilter[subfilter_position].swap_text.Replace("?","S");
				script.subfilter[subfilter_position].swap_select = false;
				script.swap_subfilter_select = false;
				script.swap_subfilter2(presubfilter.subfilter_index[subfilter_number],subfilter_position,true);
				if (script.generate_auto){generate_auto();}
			}
		}
		else
		{
			if (script.copy_subfilter_select)
			{
				subfilter_position = script.search_subfilter_copy();
				if (subfilter_position != -1)
				{
					script.subfilter[subfilter_position].swap_text = script.subfilter[subfilter_position].swap_text.Replace("*","");				
					script.subfilter[subfilter_position].copy_select = false;
				}
			}
			script.copy_subfilter_select = true;
			subfilter.copy_select = true;
			subfilter.swap_text = subfilter.swap_text.Insert(0,"*") + "*";
		}
	}
	
	// color_range_functions
	function add_color_range(color_range_number: int,precolor_range: precolor_range_class,one_color: boolean,allow_copy: boolean)
	{
		precolor_range.add_color_range(color_range_number+1,one_color);
		if (key.shift && allow_copy && color_range_number > -1)
		{
			precolor_range.color_range[color_range_number+1] = script.copy_color_range(precolor_range.color_range[color_range_number]);
		}
		else if (key.alt && script.copy_color_range_select)
		{
			precolor_range.color_range[color_range_number+1] = script.copy_color_range(script.search_color_range_copy());
			precolor_range.color_range[color_range_number+1].one_color = one_color;
		}
	}
	
	function erase_color_range(color_range_number: int,precolor_range: precolor_range_class)
	{
		Undo.RegisterUndo(script,"Color Range Erase");
		precolor_range.erase_color_range(color_range_number);
	}
	
	function swap_color_range(color_range: color_range_class,color_range_number: int,precolor_range: precolor_range_class)
	{
		if (!key.alt)
		{	
			if (!script.swap_color_range_select)
		    {
		    	color_range.swap_text = color_range.swap_text.Replace("S","?");
		        color_range.swap_select = true;
		        script.swap_color_range_select = true;
		    } 
		    else
		    {
		        script.search_color_range_swap();
		        script.swap_color_range(precolor_range,color_range_number,script.swap_precolor_range,script.swap_color_range_number);
		        precolor_range.color_range[color_range_number].swap_text = precolor_range.color_range[color_range_number].swap_text.Replace("?","S");
		        precolor_range.color_range[color_range_number].swap_select = false;
		        script.swap_color_range_select = false;
		    }
		}
		else
		{
			if (script.copy_color_range_select)
			{
				var color_range1: color_range_class = script.search_color_range_copy();
				color_range1.swap_text = color_range1.swap_text.Replace("*","");
				color_range1.copy_select = false;
			}
			script.copy_color_range_select = true;
			color_range.copy_select = true;
			color_range.swap_text = color_range.swap_text.Insert(0,"*")+"*";
		}
	}
	
	// splat functions
	function add_splat(splat_output: splat_output_class,splat_number: int,terrain_number: int,copy: boolean)
	{
		splat_output.add_splat(splat_number+1);
		
		if (copy && splat_number > -1){splat_output.splat[splat_number+1] = splat_output.splat[splat_number];}
		else
		{
			if (splat_output.splat[splat_number+1] < script.terrains[terrain_number].terrain.terrainData.splatPrototypes.Length && splat_output.splat.Count > 1){splat_output.splat[splat_number+1] = splat_output.splat[splat_number]+1;}
		}
	}
	
	// tree functions
	function add_tree(tree_number: int,tree_output: tree_output_class,terrain_number: int)
	{
		if (key.shift && tree_number > -1)
		{
			tree_output.add_tree(tree_number+1,script,false);
			tree_output.tree[tree_number+1] = script.copy_tree(tree_output.tree[tree_number]);
		}
		else if (key.alt && script.copy_tree_select)
		{
			tree_output.add_tree(tree_number+1,script,false);
			tree_output.tree[tree_number+1] = script.copy_tree(script.copy_tree1);
			tree_output.tree[tree_number+1].swap_text = "S";
		}
		else 
		{
			tree_output.add_tree(tree_number+1,script,true);
			if (tree_number > -1){if (tree_output.tree[tree_number].prototypeindex < script.terrains[terrain_number].terrain.terrainData.treePrototypes.Length){tree_output.tree[tree_number+1].prototypeindex = tree_output.tree[tree_number].prototypeindex+1;}}
		}
	}
	
	function erase_tree(tree_number: int,tree_output: tree_output_class)
	{
		Undo.RegisterUndo(script,"Tree Erase");
		tree_output.erase_tree(tree_number,script);
	}
	
	function swap_tree(tree_output: tree_output_class,tree_number: int)
	{
		if (!key.alt)
		{
			if (!script.swap_tree_select)
			{
				tree_output.tree[tree_number].swap_text = tree_output.tree[tree_number].swap_text.Replace("S","?");
				tree_output.tree[tree_number].swap_select = true;
				script.swap_tree_select = true;
			}
			else
			{
				script.search_tree_swap();
				script.swap_tree_output.tree[script.swap_tree_position].swap_text = script.swap_tree_output.tree[script.swap_tree_position].swap_text.Replace("?","S");
				script.swap_tree_output.tree[script.swap_tree_position].swap_select = false;
				script.swap_tree_select = false;
				script.swap_tree (tree_output,tree_number,script.swap_tree_output,script.swap_tree_position);
			}
		}
		else
		{
			if (script.copy_tree_select)
			{
				script.copy_tree1.swap_text = script.copy_tree1.swap_text.Replace("*","");
			}
			script.copy_tree1 = tree_output.tree[tree_number];
			script.copy_tree_select = true;
			tree_output.tree[tree_number].swap_text = tree_output.tree[tree_number].swap_text.Insert(0,"*")+"*";
			tree_output.calc_tree_value();
		}
	}
	
	// grass functions
	function add_grass(grass_output: grass_output_class,grass_number: int,terrain_number: int,copy: boolean)
	{
		grass_output.add_grass(grass_number+1);
		
		if (copy && grass_number > -1){grass_output.grass[grass_number+1].prototypeindex = grass_output.grass[grass_number].prototypeindex;}
		else
		{
			if (grass_output.grass.Count > 1)
			{
				if (grass_output.grass[grass_number+1].prototypeindex < script.terrains[terrain_number].terrain.terrainData.detailPrototypes.Length){grass_output.grass[grass_number+1].prototypeindex = grass_output.grass[grass_number].prototypeindex+1;}
			}
		}
	}
	
	// object_functions
	function add_object(object_number: int,object_output: object_output_class)
	{
		script.add_object(object_output,object_number+1);
		
		if (key.shift && object_number > -1)
		{
			object_output.object[object_number+1] = script.copy_object(object_output.object[object_number]);
			script.loop_object_copy(object_output.object[object_number+1]);
		}
		else if (key.alt && script.copy_object_select)
		{
			object_output.object[object_number+1] = script.copy_object(script.search_object_copy());
			script.loop_object_copy(object_output.object[object_number+1]);
		}
	}
	
	function erase_object(object_number: int,object_output: object_output_class)
	{
		Undo.RegisterUndo(script,"Object Erase");
		script.erase_object(object_output,object_number);
	}
	
	function swap_object(object: object_class,object_number: int,object_output: object_output_class)
	{
		if (!key.alt)
		{
			if (!script.swap_object_select)
			{
				object.swap_text = object.swap_text.Replace("S","?");
				object.swap_select = true;
				script.swap_object_select = true;
			}
			else
			{
				script.search_object_swap();
				script.swap_object(object_output,object_number,script.swap_object_output,script.swap_object_number);
				object_output.object[object_number].swap_text = object_output.object[object_number].swap_text.Replace("?","S");
				object_output.object[object_number].swap_select = false;
				script.swap_object_select = false;
			}
		}
		else
		{
			if (script.copy_object_select)
			{	
				var object3: object_class = script.search_object_copy();
				object3.swap_text = object3.swap_text.Replace("*","");
				object3.copy_select = false;
			}
			object.copy_select = true;
			script.copy_object_select = true;
			object.swap_text = object.swap_text.Insert(0,"*")+"*";
		}
	}	
	
	function save_terraincomposer(path1: String)
	{
		var file_info: FileInfo = new FileInfo(path1);
		path1 = path1.Replace(Application.dataPath+"/","Assets/");
    	
    	script.filename = file_info.Name.Replace(".prefab","");
		
    	script.set_references();
		AssetDatabase.DeleteAsset(path1);
		var prefab: Object = PrefabUtility.CreateEmptyPrefab(path1);
		PrefabUtility.ReplacePrefab(TerrainComposer_Scene,prefab,ReplacePrefabOptions.ReplaceNameBased);
		AssetDatabase.Refresh();
	}	
	
	function save_color_layout()
	{
		var path1: String = "Assets/TerrainComposer/Templates/new_setup.prefab";
		TerrainComposer_Clone = Instantiate(AssetDatabase.LoadAssetAtPath(path1,GameObject));
		TerrainComposer_Clone.name = "<TC_Clone>";
		var script_clone: terraincomposer_save = TerrainComposer_Clone.GetComponent(terraincomposer_save);
		script_clone.settings.color = script.settings.color;
		
		AssetDatabase.DeleteAsset(path1);
		var prefab: Object = PrefabUtility.CreateEmptyPrefab(path1);
		PrefabUtility.ReplacePrefab(TerrainComposer_Clone,prefab,ReplacePrefabOptions.ReplaceNameBased);
		DestroyImmediate(TerrainComposer_Clone);
	}
	
	function set_paths()
	{
		if (script)
		{
			if (script.export_path.Length == 0){script.export_path = Application.dataPath;}
        	if (script.terrain_path.Length == 0){script.terrain_path = Application.dataPath;}
        }
    }
    
    function load_terraincomposer(path1: String,backup: boolean,reference_restore: boolean) 
    {
    	var count: int;
    	
    	path1 = path1.Replace(Application.dataPath+"/","Assets/");
    	
       	if (TerrainComposer_Scene)
    	{
    		if (TerrainComposer_Scene){DestroyImmediate(TerrainComposer_Scene);}
    	}
    	
    	TerrainComposer_Scene = Instantiate(AssetDatabase.LoadAssetAtPath(path1,GameObject));
    	TerrainComposer_Scene.name = "TerrainComposer";
    	script = TerrainComposer_Scene.GetComponent(terraincomposer_save);
    	
      	if (script){script_set = true;} else {script_set = false;return;}
    	if (reference_restore){script.restore_references();}
    	script.count_layers();
    	script.reset_paths();
    	set_paths();
    	set_all_image_import_settings();
    	check_terrains();		
    	this.Repaint();
    }
     
    function load_layer(prelayer_number: int,layer_number: int,path: String): boolean
	{
		Undo.RegisterUndo(script,"Load Layer");
		
		var Load_Layer: GameObject = Instantiate(AssetDatabase.LoadAssetAtPath(path,GameObject));
		Load_Layer.name = "<Load_Layer>";
	    var script3: save_template = Load_Layer.GetComponent(save_template);
	    if (script3)
	    {
		    script.strip_layer(script.prelayers[prelayer_number],layer_number);
		    
		    script.prelayers[prelayer_number].layer[layer_number] = script.copy_layer(script3.prelayers[0].layer[0],false,false);
		  
		    script.load_loop_layer(prelayer_number,layer_number,0,0,script3);
			
			DestroyImmediate(Load_Layer);
			script.count_layers();
			
			return true;
		}
		else 
		{
			DestroyImmediate(Load_Layer);
			this.ShowNotification(GUIContent("Loading file failed!"));
		}
	}
	
	function convert_old_layer(layer: layer_class,report: boolean,update_version: boolean): boolean
	{
		if (script)
		{
			var software_id_new: float = 1.32;
			var software_id_old = layer.software_id;
			
			if (software_id_old < software_id_new)
			{
				for (var count_filter: int = 0;count_filter < layer.prefilter.filter_index.Count;++count_filter)
				{
					script.filter[layer.prefilter.filter_index[count_filter]].precurve_list[0] = script.filter[layer.prefilter.filter_index[count_filter]].precurve;
					
					if (script.filter[layer.prefilter.filter_index[count_filter]].precurve_list.Count > 1)
					{
						script.filter[layer.prefilter.filter_index[count_filter]].precurve_list[1] = script.filter[layer.prefilter.filter_index[count_filter]].prerandom_curve;
						script.filter[layer.prefilter.filter_index[count_filter]].precurve_list[1].type = curve_type_enum.Random;
					}
					
					for (var count_subfilter: int = 0;count_subfilter < script.filter[layer.prefilter.filter_index[count_filter]].presubfilter.subfilter_index.Count;++count_subfilter)
					{
						script.subfilter[script.filter[layer.prefilter.filter_index[count_filter]].presubfilter.subfilter_index[count_subfilter]].precurve_list[0] = script.subfilter[script.filter[layer.prefilter.filter_index[count_filter]].presubfilter.subfilter_index[count_subfilter]].precurve;
						
						if (script.subfilter[script.filter[layer.prefilter.filter_index[count_filter]].presubfilter.subfilter_index[count_subfilter]].precurve_list.Count > 1)
						{
							script.subfilter[script.filter[layer.prefilter.filter_index[count_filter]].presubfilter.subfilter_index[count_subfilter]].precurve_list[1] = script.subfilter[script.filter[layer.prefilter.filter_index[count_filter]].presubfilter.subfilter_index[count_subfilter]].prerandom_curve;
							script.subfilter[script.filter[layer.prefilter.filter_index[count_filter]].presubfilter.subfilter_index[count_subfilter]].precurve_list[1].type = curve_type_enum.Random;
						}
					}
				}	
				for (var count_tree: int = 0;count_tree < layer.tree_output.tree.Count;++count_tree)
				{	
					for (count_filter = 0;count_filter < layer.tree_output.tree[count_tree].prefilter.filter_index.Count;++count_filter)
					{
						script.filter[layer.tree_output.tree[count_tree].prefilter.filter_index[count_filter]].precurve_list[0] = script.filter[layer.tree_output.tree[count_tree].prefilter.filter_index[count_filter]].precurve;
						
						if (script.filter[layer.tree_output.tree[count_tree].prefilter.filter_index[count_filter]].precurve_list.Count > 1)
						{
							script.filter[layer.tree_output.tree[count_tree].prefilter.filter_index[count_filter]].precurve_list[1] = script.filter[layer.tree_output.tree[count_tree].prefilter.filter_index[count_filter]].prerandom_curve;
							script.filter[layer.tree_output.tree[count_tree].prefilter.filter_index[count_filter]].precurve_list[1].type = curve_type_enum.Random;
						}
						for (count_subfilter = 0;count_subfilter < script.filter[layer.tree_output.tree[count_tree].prefilter.filter_index[count_filter]].presubfilter.subfilter_index.Count;++count_subfilter)
						{
							script.subfilter[script.filter[layer.tree_output.tree[count_tree].prefilter.filter_index[count_filter]].presubfilter.subfilter_index[count_subfilter]].precurve_list[0] = script.subfilter[script.filter[layer.tree_output.tree[count_tree].prefilter.filter_index[count_filter]].presubfilter.subfilter_index[count_subfilter]].precurve;
								
							if (script.subfilter[script.filter[layer.tree_output.tree[count_tree].prefilter.filter_index[count_filter]].presubfilter.subfilter_index[count_subfilter]].precurve_list.Count > 1)
							{
								script.subfilter[script.filter[layer.tree_output.tree[count_tree].prefilter.filter_index[count_filter]].presubfilter.subfilter_index[count_subfilter]].precurve_list[1] = script.subfilter[script.filter[layer.tree_output.tree[count_tree].prefilter.filter_index[count_filter]].presubfilter.subfilter_index[count_subfilter]].prerandom_curve;
								script.subfilter[script.filter[layer.tree_output.tree[count_tree].prefilter.filter_index[count_filter]].presubfilter.subfilter_index[count_subfilter]].precurve_list[1].type = curve_type_enum.Random;
							}
						}
					}	
				}
				for (var count_object: int = 0;count_object < layer.object_output.object.Count;++count_object)
				{
					if (layer.object_output.object[count_object].prelayer_created){convert_old_prelayer(script.prelayers[layer.object_output.object[count_object].prelayer_index],false,false);}
				}	
				if (update_version)
				{
					layer.software_id = software_id_new;
				}
				return true;
			}
		}
		return false;
	}
	
	function convert_old_prelayer(prelayer: prelayer_class,report: boolean,update_version: boolean): boolean
	{
		if (script)
		{
			var software_id_new: float = 1.32;
			var software_id_old: float = script.software_id;
			
			if (software_id_old < software_id_new)
			{
				for (var count_layer: int = 0;count_layer < prelayer.layer.Count;++count_layer)
				{
					convert_old_layer(prelayer.layer[count_layer],false,true);
				}
				if (report)
				{
					Debug.Log("Converted filter/subfilter curves older TC file version -> "+script.software_version+" to version -> "+software_id_new);
				}
				if (update_version)
				{
					script.software_id = software_id_new;
					script.software_version = "Beta";
				}
				return true;
			}
		}
		return false;
	}
	
	function load_layergroup(path1: String,prelayer_number: int,description_number: int,layer_number: int)
	{
		Undo.RegisterUndo(script,"Load LayerGroup");
		var converted: boolean = false;
		
		var Load_LayerGroup: GameObject = Instantiate(AssetDatabase.LoadAssetAtPath(path1,GameObject));
		Load_LayerGroup.name = "<Load_LayerGroup>";
		
		var script3: save_template = Load_LayerGroup.GetComponent(save_template);
		var layer_index_length: int = script.prelayers[prelayer_number].predescription.description[description_number].layer_index.Count;
		var layer_position: int;
		
		layer_position = script.get_layer_position(script.prelayers[prelayer_number].predescription.description[description_number].layer_index.Count-1,description_number,script.prelayers[prelayer_number]);
	    
		for (var count_layer: int = 0;count_layer < script3.prelayers[0].layer.Count;++count_layer)
		{
	      	script.add_layer(script.prelayers[prelayer_number],layer_position+count_layer+1,layer_output_enum.color,description_number,script.prelayers[prelayer_number].predescription.description[description_number].layer_index.Count,false,false);
	      	
			script.prelayers[prelayer_number].layer[layer_position+count_layer+1] = script.copy_layer(script3.prelayers[0].layer[count_layer],false,false);
			script.load_loop_layer(prelayer_number,layer_position+count_layer+1,0,count_layer,script3);
		}
		DestroyImmediate(Load_LayerGroup);
		script.count_layers();
	}
    
    function load_precolor_range(path1: String)
    {
    	path1 = "Assets"+path1.Replace(Application.dataPath,String.Empty);
    	if (!load_precolor_range2(current_precolor_range,path1))
    	{
    		this.ShowNotification(GUIContent("Loading file failed!"));
    	}
    }
    
    function load_precolor_range2(precolor_range: precolor_range_class,path: String): boolean
	{
		var Precolor_Range: GameObject = Instantiate(AssetDatabase.LoadAssetAtPath(path,GameObject));
		Precolor_Range.name = "<Color_Range>";
		var script3: save_template = Precolor_Range.GetComponent(save_template);
		
		precolor_range.color_range.Clear();
		precolor_range.color_range = script3.precolor_range.color_range;
		precolor_range.color_range_value = script3.precolor_range.color_range_value;
		precolor_range.set_precolor_range_curve();
		DestroyImmediate(Precolor_Range);
		return true;
	}
    
    function save_layer(path: String,prelayer_number: int,layer_number: int)
	{
		path = "Assets"+path.Replace(Application.dataPath,String.Empty);
		
		var Save_Layer: GameObject = new GameObject();
		Save_Layer.name = "<Save_Layer>";
		var script3: save_template = Save_Layer.AddComponent(save_template);
		script3.filters = new List.<filter_class>();
		script3.subfilters = new List.<subfilter_class>();
		script3.prelayers = new List.<prelayer_class>();
		script3.prelayers.Add(new prelayer_class(0,0));
		script3.prelayers[0].layer.Add(new layer_class());
		script3.prelayers[0].layer[0] = script.copy_layer(script.prelayers[prelayer_number].layer[layer_number],false,false);
		script.save_loop_layer(prelayer_number,layer_number,0,0,script3);
		
		AssetDatabase.DeleteAsset(path);
		var prefab: Object = PrefabUtility.CreateEmptyPrefab(path);    
		PrefabUtility.ReplacePrefab(Save_Layer,prefab);
		AssetDatabase.Refresh();
		DestroyImmediate(Save_Layer);
	}
	
	function save_layergroup(path: String,prelayer_number: int,description_number: int)
	{
		path = "Assets"+path.Replace(Application.dataPath,String.Empty);
	
		var Save_LayerGroup: GameObject = new GameObject();
		Save_LayerGroup.name = "<Save_LayerGroup>";
		var script3: save_template = Save_LayerGroup.AddComponent(save_template);
		script3.filters = new List.<filter_class>();
		script3.subfilters = new List.<subfilter_class>();
		script3.prelayers = new List.<prelayer_class>();
		script3.prelayers.Add(new prelayer_class(0,0));
		script3.prelayers[0] = script.copy_layergroup(script.prelayers[prelayer_number],description_number,false);
		
		for (var count_layer: int = 0;count_layer < script.prelayers[prelayer_number].predescription.description[description_number].layer_index.Count;++count_layer)
		{
			script.save_loop_layer(prelayer_number,script.prelayers[prelayer_number].predescription.description[description_number].layer_index[count_layer],0,count_layer,script3);
		}
		
		AssetDatabase.DeleteAsset(path);
		var prefab: Object = PrefabUtility.CreateEmptyPrefab(path);    
		PrefabUtility.ReplacePrefab(Save_LayerGroup,prefab);
		AssetDatabase.Refresh();
		DestroyImmediate(Save_LayerGroup);
	}
	
	function save_precolor_range(path1: String)
	{
		path1 = "Assets"+path1.Replace(Application.dataPath,String.Empty);
		save_precolor_range2(current_precolor_range,path1);
	}
	
	function save_precolor_range2(precolor_range: precolor_range_class,path: String)
	{
		var Precolor_Range: GameObject = new GameObject();
		Precolor_Range.name = "<Color_Range>";
		var script3: save_template = Precolor_Range.AddComponent(save_template);
		script3.precolor_range = precolor_range;
		
		AssetDatabase.DeleteAsset(path);
		var prefab: Object = PrefabUtility.CreateEmptyPrefab(path);
		PrefabUtility.ReplacePrefab(Precolor_Range,prefab);
		AssetDatabase.Refresh();
		DestroyImmediate(Precolor_Range);
	}
	 
	function main_menu(obj:Object) 
    {        
    	if (obj == "undo"){Undo.PerformUndo();}
    	if (obj == "redo"){Undo.PerformRedo();}
    	if (obj == "color_scheme"){script.settings.color_scheme = !script.settings.color_scheme;} 
    	if (obj == "box_scheme"){script.settings.box_scheme = !script.settings.box_scheme;} 
    	if (obj == "color_curves"){script.settings.display_color_curves = !script.settings.display_color_curves;} 
    	if (obj == "mix_curves"){script.settings.display_mix_curves = !script.settings.display_mix_curves;} 
    	if (obj == "description_display"){script.description_display = !script.description_display;}
    	if (obj == "project_info"){script.settings.display_filename = !script.settings.display_filename;}
    	if (obj == "generate_dock"){script.generate_on_top = !script.generate_on_top;}
    	if (obj == "no_toggle_text")
    	{
    		script.settings.toggle_text_no = true;
    		script.settings.toggle_text_short = false;
    		script.settings.toggle_text_long = false;
    	}
    	
    	if (obj == "long_toggle_text")
    	{
    		script.settings.toggle_text_no = false;
    		script.settings.toggle_text_short =false;
    		script.settings.toggle_text_long = true;
    	}
    	if (obj == "short_toggle_text")
    	{
    		script.settings.toggle_text_no = false;
    		script.settings.toggle_text_short = true;
    		script.settings.toggle_text_long = false;
    	}
    	if (obj == "filter_select_text")
    	{
    		script.settings.filter_select_text = !script.settings.filter_select_text;
    	}
    	if (obj == "long_tooltip_text"){script.settings.tooltip_mode = 2;script.settings.tooltip_text_long = true;script.settings.tooltip_text_short = false;script.settings.tooltip_text_no = false;}
    	if (obj == "short_tooltip_text"){script.settings.tooltip_mode = 1;script.settings.tooltip_text_short = true;script.settings.tooltip_text_long = false;script.settings.tooltip_text_no = false;}
    	if (obj == "no_tooltip_text")
    	{
    		script.settings.tooltip_mode = 0;
    		script.settings.tooltip_text_no = true;
    		script.settings.tooltip_text_long = false;
    		script.settings.tooltip_text_short = false;
    		tooltip_text = String.Empty;
    	}
    	if (obj == "terraincomposer_info"){this.ShowNotification(GUIContent("TerrainComposer Version: Final "+read_version().ToString("F2")));}
    	if (obj == "update")
    	{
    		script.settings.update_display = !script.settings.update_display;
    	}
    	
    	if (obj == "layer_count"){script.layer_count = !script.layer_count;}
    	if (obj == "placed_count"){script.placed_count = !script.placed_count;}
    	if (obj == "terrain_reference"){terrain_reference = !terrain_reference;}
    	if (obj == "object_reference"){object_reference = !object_reference;}
    	
    	if (obj == "generate_settings")
    	{
    		script.generate_settings = !script.generate_settings;
    	}
    	if (obj == "terrain_settings")
    	{
    		script.settings.terrain_settings = !script.settings.terrain_settings;
    	}
    	if (obj == "database_restore")
    	{
    		script.settings.database_display = !script.settings.database_display;
    		if (script.settings.database_display)
    		{
    			Undo.RegisterUndo(script,"Fix Database");
    			script.loop_prelayer("(fix)(inf)",0,true);
    		}
    	}
    	if (obj == "color_scheme_display")
    	{
    		script.settings.color_scheme_display = !script.settings.color_scheme_display;
    	}
    	if (obj == "remarks"){script.settings.remarks = !script.settings.remarks;}
    	if (obj == "meshcapture_tool")
    	{
    		script.meshcapture_tool = !script.meshcapture_tool;
    		script.button_export = script.meshcapture_tool;
    		if (script.button_export){script.button_generate_text = "Export .PNG";}
        		else {script.button_generate_text = "Generate";}
    	}
    	if (obj == "measure_tool")
    	{
    		script.measure_tool = !script.measure_tool;
    		if (!script.measure_tool){script.measure_tool_active = false;}
    		else
        	{
        		script.measure_tool_active = true;
        		if (script.measure_tool_undock){create_window_measure_tool();}
        	}
    	}
    	if (obj == "quick_tools")
    	{
    		script.quick_tools = !script.quick_tools;
    	}
    	if (obj == "slice_tool")
    	{
    		script.slice_tool = !script.slice_tool;
    		if (!script.slice_tool_actives){script.button_generate_text = "Generate";script.slice_tool_active = false;} else {script.button_generate_text = "Slice";}
    	}
    	if (obj == "texture_tool")
    	{
    		script.pattern_tool.active = false;
    		script.heightmap_tool.active = false;
    		script.texture_tool.active = true;
    		create_window_texture_tool();
    	}
    	if (obj == "pattern_tool")
    	{
    		script.pattern_tool.active = true;
    		script.heightmap_tool.active = false;
    		script.texture_tool.active = false;
    		create_window_texture_tool();
    	}
    	if (obj == "heightmap_tool")
    	{
    		script.heightmap_tool.active = true;
    		script.pattern_tool.active = false;
    		script.texture_tool.active = false;
    		create_window_texture_tool();
    	}
    	
    	if (obj == "new"){new_window = true;}
    	if (obj == "open")
    	{
    		path = EditorUtility.OpenFilePanel("Open File",Application.dataPath+"/TerrainComposer/save/projects","prefab");
    		
    		if (path.Length != 0){load_terraincomposer(path,true,true);}
    	}
    	if (obj == "save")
    	{
    		path = EditorUtility.SaveFilePanel("Save File",Application.dataPath+"/TerrainComposer/save/projects","","prefab");
    		
    		if (path.Length != 0)
    		{
    			save_terraincomposer(path);
    		}
    	}
    	if (obj == "close")
    	{
    		this.Close();	
    	}	
    }
       	       
    class menu_arguments_class
    {
    	var name: String;
    	var name2: String;
    	var number0: int;
    	var number1: int;
    	var number2: int;
    	var prelayer: prelayer_class;
    }
    
    function layer_menu(obj: menu_arguments_class) 
    {        
    	var command: String = obj.name;
    	
    	if (command == "new")
    	{
    		Undo.RegisterUndo(script,"New Layer");
	    	script.prelayers[current_prelayer_number].new_layer(current_layer_number,script.filter);
    	}
    	if (command == "open")
    	{
    		path = EditorUtility.OpenFilePanel("Open File",Application.dataPath+"/TerrainComposer/save/layers","prefab");
    		
    		if (path.Length != 0){load_layer(current_prelayer_number,current_layer_number,path.Replace(Application.dataPath,"Assets"));}
    	}
    	
    	if (command == "save")
    	{
    		path = EditorUtility.SaveFilePanel("Save File",Application.dataPath+"/TerrainComposer/save/layers","","prefab");
    		
    		if (path.Length != 0)
    		{
    			save_layer(path,current_prelayer_number,current_layer_number);
    		}
    	}
    	
    	if (command == "parent")
    	{
	    	script.replace_layer(obj.number2,obj.number0,obj.number1,obj.prelayer);
        }
    }
    
    function description_menu(command: String) 
    {        
    	if (command == "new")
    	{
    		new_description = true;
    		new_description_number = current_description_number;
    	}
    	if (command == "open")
    	{
    		path = EditorUtility.OpenFilePanel("Open File",Application.dataPath+"/TerrainComposer/save/LayerGroups","prefab");
    		
    		if (path.Length != 0)
    		{
    			load_layergroup(path.Replace(Application.dataPath,"Assets"),current_prelayer_number,current_description_number,current_layer_number);
    		}
    	}
    	if (command == "save")
    	{
    		path = EditorUtility.SaveFilePanel("Save File",Application.dataPath+"/TerrainComposer/save/LayerGroups","","prefab");
    		
    		if (path.Length != 0)
    		{
    			save_layergroup(path,current_prelayer_number,current_description_number);
    		}
    	}
    	
    	if (command == "sort")
    	{
	    	Undo.RegisterUndo(script,"Sort LayerGroup");
	    	script.layer_sort(script.prelayers[current_prelayer_number],current_description_number);                            
        }
    }
    
    function precolor_menu(obj: menu_arguments_class) 
    {        
    	var command: String = obj.name;
    	
    	if (command == "open")
    	{
    		path = EditorUtility.OpenFilePanel("Open File",Application.dataPath+"/TerrainComposer/save/colors","prefab");
    		
    		if (path.Length != 0){load_precolor_range(path);}
    	}
    	if (command == "save")
    	{
    		path = EditorUtility.SaveFilePanel("Save File",Application.dataPath+"/TerrainComposer/save/colors","","prefab");
    		
    		if (path.Length != 0)
    		{
    			save_precolor_range(path);
    		}
    	}
    }
    
    function view_menu(obj: menu_arguments_class)
    {
    	var command: String = obj.name;
    	
    	if (command == "view_heightmap_layer"){obj.prelayer.view_heightmap_layer = !obj.prelayer.view_heightmap_layer;}
    	if (command == "view_color_layer"){obj.prelayer.view_color_layer = !obj.prelayer.view_color_layer;}
    	if (command == "view_splat_layer"){obj.prelayer.view_splat_layer = !obj.prelayer.view_splat_layer;}
    	if (command == "view_tree_layer"){obj.prelayer.view_tree_layer = !obj.prelayer.view_tree_layer;}
    	if (command == "view_grass_layer"){obj.prelayer.view_grass_layer = !obj.prelayer.view_grass_layer;}
    	if (command == "view_object_layer"){obj.prelayer.view_object_layer = !obj.prelayer.view_object_layer;}
    	
    	if (command == "view_only_selected")
    	{
    		obj.prelayer.view_only_selected = !obj.prelayer.view_only_selected;
    		if (obj.prelayer.view_only_selected){script.set_view_only_selected(obj.prelayer,obj.prelayer.layer_output);}
    	}
    	if (command == "view_all")
    	{
    		obj.prelayer.view_only_selected = false;
    		obj.prelayer.view_heightmap_layer = obj.prelayer.view_color_layer = obj.prelayer.view_splat_layer = obj.prelayer.view_tree_layer = obj.prelayer.view_grass_layer = obj.prelayer.view_object_layer = true;
    	}
    }
    
    function curve_menu(obj: curve_menu_arguments_class)
    {
    	var command: String = obj.name;
    	var curve: AnimationCurve;
    	if (command == "add_key")
    	{
    		var value0: float = obj.output_key;
    		var length: float = obj.output_length;
    		curve = new AnimationCurve(obj.precurve.curve.keys);
    		var value_y: float = 0;
    		if (obj.param0 == "height"){value_y = height/heightmap_scale.y;}
    		if (obj.param0 == "degree"){value_y = degree/90;}
    		var key: Keyframe;
    		key.time = value0/(length-1);
    		key.value = value_y;
    		if (curve.AddKey(key) == -1){curve.MoveKey(value0/(length-1),key);}
    		obj.precurve.curve = new AnimationCurve(curve.keys);
    	}
    	
    	if (obj.name == "copy")
    	{
    		if (script.curve_in_memory_old){script.curve_in_memory_old.curve_in_memory = false;script.curve_in_memory_old.curve_text = "Curve";}
    		curve_copy = obj.precurve.curve;
    		obj.precurve.curve_in_memory = true; 
    		obj.precurve.curve_text = "*Curve*";
    		script.curve_in_memory_old = obj.precurve;
    	}
    	if (obj.name == "paste")
    	{
    		if (curve_copy){obj.precurve.curve = new AnimationCurve(curve_copy.keys);}
    	}
    	
    	if (obj.name == "set_zero")
    	{
    		Undo.RegisterUndo(script,"Set Zero Curve");
			obj.precurve.set_zero();
			if (script.generate_auto){generate_auto();}
    	}
    	if (obj.name == "invert")
    	{
    		obj.precurve.set_invert();
    		if (script.generate_auto){generate_auto();}
    	}
    	if (obj.name == "default")
    	{
    		Undo.RegisterUndo(script,"Default Curve");
			obj.precurve.set_default();
			if (script.generate_auto){generate_auto();}
    	}
    	if (obj.name == "set default")
    	{
    		Undo.RegisterUndo(script,"Set Default Curve");
			obj.precurve.set_as_default();
    	}
    	
    	this.Repaint();
    }
    
    class curve_menu_arguments_class 
    {
    	var precurve: animation_curve_class = new animation_curve_class();
    	var output_length: float;
    	var output_key: float;
    	var name: String;
    	var param0: String;
    }
    
    function curve_menu_button(precurve: animation_curve_class,output_length: int,rect: Rect)
    {
    	var userdata: curve_menu_arguments_class[] = new curve_menu_arguments_class[6];
    	var userdata2: curve_menu_arguments_class[] = new curve_menu_arguments_class[output_length*2];
       
        var menu: GenericMenu;
    	menu = new GenericMenu ();
    	userdata[0] = new curve_menu_arguments_class(); 
    	userdata[0].name = "copy";                   
    	userdata[0].precurve = precurve;            
       	
       	userdata[1] = new curve_menu_arguments_class();
       	userdata[1].name = "paste";
       	userdata[1].precurve = precurve; 
       	
       	userdata[2] = new curve_menu_arguments_class(); 
        userdata[2].precurve = precurve;
    	userdata[2].name = "set_zero";   
                       
        userdata[3] = new curve_menu_arguments_class(); 
        userdata[3].precurve = precurve;
    	userdata[3].name = "invert";  
    	
    	userdata[4] = new curve_menu_arguments_class(); 
    	userdata[4].precurve = precurve;
    	userdata[4].name = "default";  
    	
    	userdata[5] = new curve_menu_arguments_class(); 
    	userdata[5].precurve = precurve;
    	userdata[5].name = "set default";   
    	if (Application.platform == RuntimePlatform.OSXEditor)
    	{
        	menu.AddItem (new GUIContent("Copy"),false,curve_menu,userdata[0]);
	        menu.AddItem (new GUIContent("Paste"),false,curve_menu,userdata[1]);                
	        menu.AddSeparator(""); 
	     	menu.AddItem (new GUIContent("Invert"),false,curve_menu,userdata[3]);                
	        menu.AddItem (new GUIContent("Set Zero"),false,curve_menu,userdata[2]);                
	     	menu.AddItem (new GUIContent("Default"),false,curve_menu,userdata[4]);                
	        menu.AddSeparator(""); 
	        menu.AddItem (new GUIContent("Set Default"),false,curve_menu,userdata[5]);                
        }
        else
        {	
        	menu.AddItem (new GUIContent("Edit/Copy"),false,curve_menu,userdata[0]);
	        menu.AddItem (new GUIContent("Edit/Paste"),false,curve_menu,userdata[1]);                
	        menu.AddSeparator(""); 
	     	menu.AddItem (new GUIContent("Line/Invert"),false,curve_menu,userdata[3]);                
	        menu.AddItem (new GUIContent("Line/Set Zero"),false,curve_menu,userdata[2]);                
	     	menu.AddItem (new GUIContent("Line/Default"),false,curve_menu,userdata[4]);                
	        menu.AddSeparator("Line/"); 
	        menu.AddItem (new GUIContent("Line/Set Default"),false,curve_menu,userdata[5]);                
        }
      
        menu.DropDown (rect);
    }
    
    function copy_curve(curve1: AnimationCurve,curve2: AnimationCurve)
    {
    	curve1 = new AnimationCurve(curve2.keys);
    }

	static function get_terrain_point(terrain: Terrain,point: Vector3,interpolated: boolean): Vector2
	{
		var terrain_point: Vector2;
		
		var position: Vector3 = point-terrain.transform.position;
		var resolution: float;
		if (interpolated){resolution = terrain.terrainData.heightmapResolution;} else {resolution = terrain.terrainData.alphamapResolution;}
								
		var rel_x: float = terrain.terrainData.size.x / resolution;
		var rel_z: float = terrain.terrainData.size.z / resolution;
		terrain_point.x = (position.x/rel_x);
		terrain_point.y = (position.z/rel_z);
		
		if (interpolated)
		{
			terrain_point.x = terrain_point.x / resolution;
			terrain_point.y = terrain_point.y / resolution;
		}
		return terrain_point;
	}	
	
	function auto_search_list(preimage: image_class): int
	{
		if (preimage.image.Count > 1)
		{
			if (!preimage.image[0]){return;}
			var path: String = AssetDatabase.GetAssetPath(preimage.image[0]);
			if (path == String.Empty){return;}
			var name: String = Path.GetFileName(path);
			path = path.Replace(name,String.Empty);
			
			var image_search_format: String = preimage.auto_search.format;
			var format: String;
			var digit: String = new String("0"[0],preimage.auto_search.digits);
			
			var tiles: int = Mathf.Sqrt(preimage.image.Count);
			var count_image: int = 0;
			var texture: Texture2D;
				
			for (var x: int = 0;x < tiles;++x)
			{
				for (var y: int = 0;y < tiles;++y)
				{
					format = image_search_format.Replace("%x",(x+preimage.auto_search.start_x).ToString(digit));
					format = format.Replace("%y",(y+preimage.auto_search.start_y).ToString(digit));
					format = format.Replace("%n",(count_image+preimage.auto_search.start_n).ToString(digit));
					
					texture = AssetDatabase.LoadAssetAtPath(path+preimage.auto_search.filename+format+preimage.auto_search.extension,Texture2D);
					
					if (texture)
					{
						preimage.image[count_image] = texture;
						set_image_import_settings(preimage.image[count_image]);
					}
					++count_image;
				}
			}
		}
	}
	
	function strip_auto_search_image_file(preimage: image_class)
	{
		var path: String = AssetDatabase.GetAssetPath(preimage.image[0]);
		if (path.Length == 0){return;}
		var digit_x: String = new String(preimage.auto_search.start_x.ToString()[0],preimage.auto_search.digits);
		var digit_y: String = new String(preimage.auto_search.start_y.ToString()[0],preimage.auto_search.digits);
		var number: int = 0;
		
		var format: String = preimage.auto_search.format.Replace("%x",number.ToString(digit_x));
		format = format.Replace("%y",number.ToString(digit_y));
		format = format.Replace("%n",number.ToString(digit_x));
		
		preimage.auto_search.filename = (Path.GetFileNameWithoutExtension(path)).Replace(format,String.Empty);;
		preimage.auto_search.extension = Path.GetExtension(path);
		
		//preimage.auto_search_filename = preimage.auto_search_filename.Replace(preimage.auto_search_extension,String.Empty);
	}
	
	function erase_terrains(length: int,terrainData: boolean)
	{
		for (var count_terrain: int = 0;count_terrain < length+1;++count_terrain)
		{
			erase_terrain(script.terrains[script.terrains.Count-1],terrainData);
		}
		script.reset_terrains_tiles(script);
		if (script.settings.auto_fit_terrains){fit_all_terrains();}
		if (terrainData){AssetDatabase.Refresh();}
	}
	
	function erase_terrain(preterrain: terrain_class,terrainData: boolean)
	{
		if (preterrain.terrain)
		{
			if (terrainData){AssetDatabase.DeleteAsset(AssetDatabase.GetAssetPath(preterrain.terrain.terrainData));} 
			DestroyImmediate(preterrain.terrain.gameObject);
		}
		script.set_terrain_length(script.terrains.Count-1);		
	}
	
	function create_terrain(preterrain: terrain_class,length: int,name_number: int)
	{
		var copy_terrain_settings: boolean = false;
		if (script.terrains.Count > 1 && preterrain.index > 0 && preterrain.copy_terrain_settings){copy_terrain_settings = true;}
		
		for (var count_terrain: int = 0;count_terrain < length;++count_terrain)
		{
		    var terrainData: TerrainData = new TerrainData();
			
			terrainData.heightmapResolution = preterrain.heightmap_resolution;
			terrainData.baseMapResolution = preterrain.basemap_resolution;
			terrainData.alphamapResolution = preterrain.splatmap_resolution;
			terrainData.SetDetailResolution(preterrain.detail_resolution,preterrain.detail_resolution_per_patch);
			if (preterrain.size.x <= 0){preterrain.size.x = 1000;}
			if (preterrain.size.z <= 0){preterrain.size.z = 1000;}
			if (preterrain.size.y <= 0){preterrain.size.y = 250;}
		    terrainData.size = preterrain.size;
	    
		    var object: GameObject = new GameObject(); 
		    if (script.terrain_parent){object.transform.parent = script.terrain_parent;}
		   
		    var terrain: Terrain = object.AddComponent(Terrain);
		    var script_collider: TerrainCollider = object.AddComponent(TerrainCollider);
		    terrain.name = script.terrain_scene_name+(count_terrain+name_number);
		    terrain.terrainData = terrainData;
		    var path: String = script.terrain_path;
		    path = "Assets"+path.Replace(Application.dataPath,String.Empty);
		    path += "/"+script.terrain_asset_name+(count_terrain+name_number)+".asset";
			AssetDatabase.CreateAsset(terrainData,path);
		    script_collider.terrainData = terrainData;
		    if (script.terrains.Count < count_terrain+name_number){script.set_terrain_length(script.terrains.Count+1);}
		    if (copy_terrain_settings){script.terrains[count_terrain+name_number-1] = script.copy_terrain(script.terrains[preterrain.copy_terrain]);}
		    script.terrains[count_terrain+name_number-1].terrain = terrain;
		    script.set_terrain_parameters(script.terrains[count_terrain+name_number-1]);
		    script.get_terrain_settings(script.terrains[count_terrain+name_number-1],"(res)(con)(fir)");
		    script.terrains[count_terrain+name_number-1].tile_x = 0;
		    script.terrains[count_terrain+name_number-1].tile_z = 0;
		    script.terrains[count_terrain+name_number-1].tiles = Vector2(1,1);
		    script.terrains[count_terrain+name_number-1].terrain.transform.position = Vector3(-preterrain.size.x/2,0,-preterrain.size.z/2);
		    script.set_terrain_splat_textures(script.terrains[count_terrain+name_number-1],script.terrains[count_terrain+name_number-1]);
		    script.set_terrain_trees(script.terrains[count_terrain+name_number-1]);
		    script.set_terrain_details(script.terrains[count_terrain+name_number-1]);
		    script.terrains[count_terrain+name_number-1].prearea.max();
		    script.terrains[count_terrain+name_number-1].foldout = false;
		    assign_terrain_splat_alpha(script.terrains[count_terrain+name_number-1]);
		}
		if (script.settings.auto_fit_terrains){fit_all_terrains();}
		AssetDatabase.Refresh();
	}
	
	function check_terrains()
	{
		for (var count_terrain: int = 0;count_terrain < script.terrains.Count;++count_terrain)
		{
			script.check_synchronous_terrain_size(script.terrains[count_terrain]);
			script.check_synchronous_terrain_splat_textures(script.terrains[count_terrain]);
			script.check_synchronous_terrain_resolutions(script.terrains[count_terrain]);
			script.check_synchronous_terrain_trees(script.terrains[count_terrain]);
			script.check_synchronous_terrain_detail(script.terrains[count_terrain]);
			
			assign_terrain_splat_alpha(script.terrains[count_terrain]);
		}
	}
	
	function assign_terrain_splat_alpha(preterrain1: terrain_class)
	{
		if (preterrain1.terrain)
		{
			if (!preterrain1.terrain.terrainData){return;}
			var path: String = AssetDatabase.GetAssetPath(preterrain1.terrain.terrainData);
			
        	var objects: Object[] = AssetDatabase.LoadAllAssetsAtPath(path);
        	
        	preterrain1.splat_alpha = new Texture2D[objects.Length-1];
        	
        	for (var count_object: int = 0;count_object < objects.Length;++count_object)
        	{
        		if (objects[count_object].GetType() == Texture2D)
        		{
        			var numbers_only: String = Regex.Replace(objects[count_object].name,"[^0-9]","");
 					var index: int;
 					index = Convert.ToInt32(numbers_only);
 					
 					preterrain1.splat_alpha[index] = objects[count_object];
 				}
        	}
        }
	}
	
	function assign_all_terrain_splat_alpha()
	{
		for (var count_terrain: int = 0;count_terrain < script.terrains.Count;++count_terrain)
		{
			assign_terrain_splat_alpha(script.terrains[count_terrain]);
		}
	}
	
	function update_terrain_asset(preterrain: terrain_class)
	{
		if (preterrain.terrain)
		{
			var path: String = AssetDatabase.GetAssetPath(preterrain.terrain.terrainData);
			
			AssetDatabase.ImportAsset(path);
        }
	}
	
	function update_all_terrain_asset()
	{
		for (var count_terrain: int = 0;count_terrain < script.terrains.Count;++count_terrain)
		{
			update_terrain_asset(script.terrains[count_terrain]);
		}
	}
	
	function check_content_done()
	{
	    if (!content_checked)
        {
	        if (EditorApplication.timeSinceStartup < 10)
	        {
	        	set_all_image_import_settings();
	        	if (read_check() > 0)
	        	{
	        		check_content_version();
	        		content_checked = true;
	        	}
	        	else
	        	{
	        		content_checked = true;
	        	}
	        }
	    }
        if (script.settings.loading > 0)
        {
        	var update_select = read_check();
        	if (script.settings.loading == 1)
        	{
	        	if (script.settings.contents.isDone)
	        	{
	        		script.settings.loading = 0;
	        		var new_version: float;
	        		var old_version: float;
	        		
	        		old_version = read_version();
	        		write_checked(System.DateTime.Now.Day.ToString());
	        		if (Single.TryParse(script.settings.contents.text,new_version))
	        		{
		        		script.settings.new_version = new_version;
		        		script.settings.old_version = old_version;
		        		if (new_version > old_version)
		        		{
		        			if (update_select == 0)
		        			{
		        				script.settings.update_version = true;
		        			}
		        			else if (update_select == 1)
		        			{
		        				script.settings.update_display = true;
		        				script.settings.update_version = true;
		        			}
		        			else if (update_select > 1)
		        			{
		        				script.settings.update_version = true;
		        				content_version();		
		        			}
		        		}
		        		else
		        		{
		        			script.settings.update_version = false;
		        		}
		        	}
		        }
	        }
        	else if (script.settings.loading == 2)
        	{
	        	if (script.settings.contents.isDone)
	        	{
	        		script.settings.loading = 0;
	        		script.settings.update_version2 = true;
	        		script.settings.update_version = false;
	        		File.WriteAllBytes(Application.dataPath+"/TerrainComposer/Update/TerrainComposer.unitypackage",script.settings.contents.bytes);
	        		if (update_select < 3)
	        		{
	        			script.settings.update_display = true;
	        		}
	        		else if (update_select == 3)
	        		{
	        			script.settings.update_display = true;
	        			import_contents(Application.dataPath+"/TerrainComposer/Update/TerrainComposer.unitypackage",false);
	        		}
	        		else if (update_select == 4)
	        		{
	        			import_contents(Application.dataPath+"/TerrainComposer/Update/TerrainComposer.unitypackage",false);
	        		}
	        	}
	        }
	        else if (script.settings.loading == 3)
	        {
	        	if (script.settings.new_version == read_version())
	        	{
	        		Debug.Log("Updated TerrainComposer version "+script.settings.old_version+" to version "+read_version().ToString("F3")+", Read the 'TerrainComposer Getting Started' PDF Document in the TerrainComposer folder");
	        		this.ShowNotification(GUIContent("Please read the added 'TerrainComposer Getting Started' PDF Document in the TerrainComposer folder"));
	        		script.settings.loading = 0;
	        	}
	        	else if (EditorApplication.timeSinceStartup > script.settings.time_out + 60){script.settings.loading = 0;Debug.Log("Time out with importing TerrainComposer update...");}
	        }
	    }
	}
	
	function triplanar_shader(active: boolean)
	{
		var count_terrain: int;
		var terrain_object: GameObject;
		
		if (active)
		{
			AssetDatabase.ImportPackage(Application.dataPath+"/TerrainComposer/Shaders/TriPlanar_on.unitypackage",false);
			var triplanar_script: TriPlanarTerrainScript;
			
			for (count_terrain = 0;count_terrain < script.terrains.Count;++count_terrain)
			{
				if (script.terrains[count_terrain].terrain)
				{
					terrain_object = script.terrains[count_terrain].terrain.gameObject;
					triplanar_script = terrain_object.GetComponent(TriPlanarTerrainScript);
					if (!triplanar_script){script.terrains[count_terrain].script_triplanar = script.terrains[count_terrain].terrain.gameObject.AddComponent(TriPlanarTerrainScript);}
						else {script.terrains[count_terrain].script_triplanar = triplanar_script;}
					script.terrains[count_terrain].script_triplanar.terDat = script.terrains[count_terrain].terrain.terrainData;
					script.triplanar_init(script.terrains[count_terrain]);
				}
			}
		}
		else
		{
			FileUtil.DeleteFileOrDirectory(Application.dataPath+"/TerrainComposer/Shaders/TriPlanarTerrain/Shaders");		
			AssetDatabase.ImportPackage(Application.dataPath+"/TerrainComposer/Shaders/TriPlanar_off.unitypackage",false);
			
			for (count_terrain = 0;count_terrain < script.terrains.Count;++count_terrain)
			{
				if (script.terrains[count_terrain].terrain)
				{
					terrain_object = script.terrains[count_terrain].terrain.gameObject;
					DestroyImmediate(terrain_object.GetComponent(TriPlanarTerrainScript));
				}
			}
		}
	}
	
	function init_color_splat_textures()
	{
		if (!script.settings.color_splatPrototypes[0].texture)
		{
			script.settings.color_splatPrototypes[0].texture = AssetDatabase.LoadAssetAtPath("Assets/TerrainComposer/Templates/Textures/ground_red.png",Texture) as Texture2D;	
			script.settings.color_splatPrototypes[1].texture = AssetDatabase.LoadAssetAtPath("Assets/TerrainComposer/Templates/Textures/ground_green.png",Texture) as Texture2D;	
			script.settings.color_splatPrototypes[2].texture = AssetDatabase.LoadAssetAtPath("Assets/TerrainComposer/Templates/Textures/ground_blue.png",Texture) as Texture2D;	
			
			set_image_import_settings(script.settings.color_splatPrototypes[0].texture);
			set_image_import_settings(script.settings.color_splatPrototypes[1].texture);
			set_image_import_settings(script.settings.color_splatPrototypes[2].texture);
		}
	}
	
	function init_colormap()
	{
		if (script.settings.colormap)
		{
			for (var count_terrain: int = 0;count_terrain < script.terrains.Count;++count_terrain)
			{
				if (!script.terrains[count_terrain].colormap.texture)
				{
					script.terrains[count_terrain].colormap.texture = AssetDatabase.LoadAssetAtPath("Assets/TerrainComposer/Templates/Textures/black.png",Texture) as Texture2D;	
				}
			}
		}
	}
		
	function set_image_import_settings(image: Texture2D)
	{
		if (!image){return;}
		
		var path: String = AssetDatabase.GetAssetPath(image);
		if (path.Length == 0){Debug.Log("asdfsadf");return;}
		var textureImporter: TextureImporter = AssetImporter.GetAtPath(path) as TextureImporter;
		
		var change: boolean = false;
		
		if (!textureImporter.isReadable)
		{
			textureImporter.isReadable = true;
			change = true;
		}
		if (textureImporter.textureFormat == TextureImporterFormat.AutomaticTruecolor)
		{}
			else
			{
				textureImporter.textureFormat = TextureImporterFormat.AutomaticTruecolor;
				change = true;
			}
		if (change){AssetDatabase.ImportAsset(path);}
	}
	
	function set_all_image_import_settings()
	{
		var count_image: int;
		
		for (var count_filter: int = 0;count_filter < script.filter.Count;++count_filter)
		{
			for (count_image = 0;count_image < script.filter[count_filter].preimage.image.Count;++count_image)
			{
				set_image_import_settings(script.filter[count_filter].preimage.image[count_image]);
			}
		}
		
		for (var count_subfilter: int = 0;count_subfilter < script.subfilter.Count;++count_subfilter)
		{
			for (count_image = 0;count_image < script.subfilter[count_subfilter].preimage.image.Count;++count_image)
			{
				set_image_import_settings(script.subfilter[count_subfilter].preimage.image[count_image]);
			}
		}
	}
	
	function assign_combinechildren(): GameObject
	{
		script.Combine_Children = AssetDatabase.LoadAssetAtPath("Assets/TerrainComposer/CombineChildren.prefab",GameObject);
	}
	
	function import_contents(path: String,window: boolean)
	{
		var file_info: FileInfo = new FileInfo(Application.dataPath+"/tc_build/build.txt");
		if (file_info.Exists){Debug.Log("Updating canceled because of development version");} 
		else 
		{
			AssetDatabase.ImportPackage(path,window);
		}
	
		script.settings.update_version2 = false;
		script.settings.time_out = EditorApplication.timeSinceStartup;
		script.settings.loading = 3;
	}
	
	function fit_all_terrains()
	{
		var fit: int = script.fit_terrain_tiles(current_terrain,true);
		script.set_terrain_settings(script.preterrain,"(siz)");
		if (fit == -1){this.ShowNotification(GUIContent("Only one Terrain tile!"));}
		if (fit == -2){this.ShowNotification(GUIContent("Assign all Terrains!"));}
		if (fit == -3)
		{
			var terrain_needed: int = Mathf.Sqrt(script.terrains.Count);
			var terrain_needed_min: int = script.terrains.Count-Mathf.Pow(terrain_needed,2);
			var terrain_needed_max: int = Mathf.Pow(terrain_needed+1,2)-script.terrains.Count;
			var terrain_text1: String;
			var terrain_text2: String;
						        			
			if (terrain_needed_min < 2){terrain_text1 = "terrain";} else {terrain_text1 = "terrains";}
			if (terrain_needed_max < 2){terrain_text2 = "terrain";} else {terrain_text2 = "terrains";}
						        			
			this.ShowNotification(GUIContent("Terrain List length needs to be 1,4,9,16,25,36,49,64,etc. You need to add "+terrain_needed_max+" "+terrain_text2+" or erase "+terrain_needed_min+" "+terrain_text1));
		}
	}
	
	function create_window_texture_tool()
	{
		script.image_tools = true;
		texture_tool = EditorWindow.GetWindow(FilterTexture);
	    texture_tool.ShowWindow();
	    texture_tool.script = script;
	    texture_tool.tc_script = this;
	    script.tc_id = this.GetInstanceID();
	    texture_tool.pattern_first_init();
	    texture_tool.heightmap_first_init();
	}
	
	function process_out(bytes: byte[]): byte[]
	{
		for (var count_byte: int = 0;count_byte < bytes.Length;++count_byte)
		{
			bytes[count_byte] = 255-bytes[count_byte];
		}
		return bytes;
	}
	
	function create_window_measure_tool()
	{
		measure_tool = EditorWindow.GetWindow (MeasureTool);
		measure_tool_id = measure_tool.GetInstanceID();
	    measure_tool.ShowWindow();
	    measure_tool.script = script;
	    measure_tool.tc_script = this;
	    script.tc_id = this.GetInstanceID();
	}
	
	function create_preview_window(texture: Texture2D,text: String)
	{
		if (!texture){return;}
		preview_window = EditorWindow.GetWindow(ShowTexture);
		if (preview_window.texture == texture){preview_window.Close();return;}
		preview_window.minSize = Vector2(512,512);
		preview_window.title = text;
		preview_window.texture = texture;
	}
	
	function stitch_terrains()
	{
		var same_code:int = script.check_terrains_same_resolution();
		if (same_code == 1)
		{
			script.get_terrains_position();
			if (script.stitch_terrains(script.stitch_tool_border_influence)){script.stitch_terrains(script.terrains[0].heightmap_conversion.x*1.5);}
		}
		else if (same_code == -1){this.ShowNotification(GUIContent("The heightmap resolution of all Terrains must be the same"));}
		else if (same_code == -2){this.ShowNotification(GUIContent("All Terrains must be assigned"));}
	}
	
	function read_version(): float
	{
		var sr: StreamReader = new File.OpenText(Application.dataPath+"/TerrainComposer/Update/version.txt");
		var text: String = sr.ReadLine();
		sr.Close();
		
		var version: float;
		Single.TryParse(text,version);
		
		return version;
	}
	
	function write_check(text: String)
	{
		var sw: StreamWriter = new StreamWriter(Application.dataPath+"/TerrainComposer/Update/check.txt");
		sw.WriteLine(text);
		sw.Close();
	}
	
	function read_check(): int
	{
		if (!File.Exists(Application.dataPath+"/TerrainComposer/Update/check.txt")){write_check("4");}
		
		var sr: StreamReader = new File.OpenText(Application.dataPath+"/TerrainComposer/Update/check.txt");
		var text: String = sr.ReadLine();
		sr.Close();
		
		var version: int;
		Int32.TryParse(text,version);
		
		return version;
	}
	
	function write_checked(text: String)
	{
		var sw: StreamWriter = new StreamWriter(Application.dataPath+"/TerrainComposer/Update/last_checked.txt");
		sw.WriteLine(text);
		sw.Close();
	}
	
	function read_checked(): float
	{
		if (!File.Exists(Application.dataPath+"/TerrainComposer/Update/last_checked.txt")){write_checked("-1");}
		
		var sr: StreamReader = new File.OpenText(Application.dataPath+"/TerrainComposer/Update/last_checked.txt");
		
		var text: String = sr.ReadLine();
		sr.Close();
		
		var version: float;
		Single.TryParse(text,version);
		
		return version;
	}
	
	@DrawGizmo(GizmoType.NotSelected | GizmoType.Active)
	static function RenderCustomGizmo(objectTransform: Transform,gizmoType:  GizmoType)
    {
    	var e: Event = Event.current;
        if (e == null || !script || !script.measure_tool_active || e_old == null){e_old = e;return;}
		
		if (e.button == 1 && e_old.button != 1 && e.control){script.measure_tool_clicked = !script.measure_tool_clicked;}
        e_old = e;
		
		if (!script.measure_tool_clicked)
    	{	            
	    	var ray: Ray = HandleUtility.GUIPointToWorldRay (e.mousePosition);
	    	
	    	if (Physics.Raycast (ray.origin, ray.direction,hit,script.measure_tool_range))
	    	{
	    		script.measure_tool_inrange = true;
	        	if (script.sphere_draw)
	        	{
	        		Gizmos.color = Color.red;
	            	Gizmos.DrawSphere(hit.point,script.sphere_radius);
	            	script.measure_tool_point_old = hit.point;
	        	}
				hit_mesh = hit.collider.gameObject;
				if (hit_mesh){terrain_measure = hit_mesh.GetComponent(Terrain);}
				if (terrain_measure)
	            {
	            	heightmap_scale = terrain_measure.terrainData.size;
	            	height = terrain_measure.SampleHeight(hit.point);
	            	var terrain_point_interpolated: Vector2 = get_terrain_point(terrain_measure,hit.point,true);
	            	var terrain_point: Vector2 = get_terrain_point(terrain_measure,hit.point,false);
	            	script.measure_tool_terrain_point = terrain_point;
	            	script.measure_tool_terrain_point_interpolated = terrain_point_interpolated;
	            	normal = terrain_measure.terrainData.GetInterpolatedNormal(terrain_point_interpolated.x,terrain_point_interpolated.y);
	            	var px: float = (hit.point.x-terrain_measure.transform.position.x);
	            	var pz: float = (hit.point.z-terrain_measure.transform.position.z);
	            	
	            	var terrain_index: int = script.find_terrain_by_name(terrain_measure);
	            	if (terrain_index != -1)
	            	{
	            		degree = script.calc_terrain_angle(script.terrains[terrain_index],px,pz,script.settings.smooth_angle);//hit.point.x-terrain_measure.transform.position.x,hit.point.z-terrain_measure.tranform.position.z);
	            	}
	            	
	            	splat_length = terrain_measure.terrainData.splatPrototypes.Length;
	            	if (splat_length > 0){splat = terrain_measure.terrainData.GetAlphamaps(terrain_point.x,terrain_point.y,1,1);}
	            	detail_length = terrain_measure.terrainData.detailPrototypes.Length;
	            	
	            	for (var count_detail: int = 0;count_detail < detail_length;++count_detail)
	            	{
	            		detail1 = terrain_measure.terrainData.GetDetailLayer(terrain_point_interpolated.x*terrain_measure.terrainData.detailResolution,terrain_point_interpolated.y*terrain_measure.terrainData.detailResolution,1,1,count_detail);
	            		detail[count_detail] = detail1[0,0];
	            	}
	            }
	            else
	            {
	            	
	            }
				SceneView.lastActiveSceneView.Repaint();	
			} else {script.measure_tool_inrange = false;}
		}
	    else
	    {
	     	Gizmos.color = Color.red;
	    	Gizmos.DrawSphere(script.measure_tool_point_old,script.sphere_radius);
		}
    }
	
	function draw_measure_tool()
	{
       	if (!script){return;}
       	if (!script.measure_tool_undock){script.measure_tool_foldout = EditorGUILayout.Foldout(script.measure_tool_foldout,"Measure Tool");}
       	
       	if (script.measure_tool_foldout || script.measure_tool_undock)
       	{
	       	EditorGUILayout.BeginHorizontal();
	       	GUILayout.Space(15);
	       	EditorGUILayout.LabelField("Active",GUILayout.Width(100));
	       	gui_changed_old = GUI.changed;
	       	GUI.changed = false;
	       	script.measure_tool_active = EditorGUILayout.Toggle(script.measure_tool_active,GUILayout.Width(25));
	       	if (GUI.changed)
	       	{
	       		if (script.measure_tool_undock){script.measure_tool = script.measure_tool_active;this.Repaint();}
	       	}
	       	GUI.changed = gui_changed_old;
			if (!script.measure_tool_undock)
			{	       	
		       	if (script.settings.tooltip_mode != 0)
		    	{
		    		tooltip_text = "Put Measure Tool in seperate window";
		    	}
		       	if (GUILayout.Button(GUIContent("Undock",tooltip_text),GUILayout.Width(70)))
		       	{
		       		script.measure_tool_undock = true;
		       		create_window_measure_tool();
		       	}
		    }
		    else
		    {
		    	if (script.settings.tooltip_mode != 0)
		    	{
		    		tooltip_text = "Put Measure Tool in TerrainComposer window";
		    	}
		    	if (GUILayout.Button(GUIContent("Dock",tooltip_text),GUILayout.Width(70)))
		       	{
		       		script.measure_tool_undock = false;
		       		measure_tool.undock = false;
		       		measure_tool.Close();
		       	}
		    }
			EditorGUILayout.EndHorizontal();
	       	
	       	GUILayout.Space(5);
	       	
	       	EditorGUILayout.BeginHorizontal();
	       	GUILayout.Space(15);
	       	if (terrain_measure)
	       	{
	       		EditorGUILayout.LabelField("Terrain",GUILayout.Width(100));
	       		EditorGUILayout.LabelField(""+terrain_measure.name,GUILayout.Width(70));
	       	}
	       	else
	       	{
	       		if (hit_mesh)
	       		{
	       			EditorGUILayout.LabelField("Mesh",GUILayout.Width(100));
	       			EditorGUILayout.LabelField(""+hit_mesh.name,GUILayout.Width(70));
	       		}
	       		else
	       		{
	       			EditorGUILayout.LabelField("?",GUILayout.Width(70));
	       		}
	       	}
	       	EditorGUILayout.EndHorizontal();
	       	
	       	GUILayout.Space(5);
	       	
	       	EditorGUILayout.BeginHorizontal();
	       	GUILayout.Space(15);
	       	EditorGUILayout.LabelField("World Pos",GUILayout.Width(100));
	       	EditorGUILayout.LabelField("X "+hit.point.x,GUILayout.Width(150));
	       	EditorGUILayout.EndHorizontal();
	       	
	       	EditorGUILayout.BeginHorizontal();
	       	GUILayout.Space(119);
	       	EditorGUILayout.LabelField("Y "+hit.point.y,GUILayout.Width(150));
			EditorGUILayout.EndHorizontal();
	       	
	       	EditorGUILayout.BeginHorizontal();
	       	GUILayout.Space(119);
	       	EditorGUILayout.LabelField("Z "+hit.point.z,GUILayout.Width(150));
			EditorGUILayout.EndHorizontal();
	       	
	       	GUILayout.Space(5);
	       	
	       	EditorGUILayout.BeginHorizontal();
	       	GUILayout.Space(15);
	       	EditorGUILayout.LabelField("Local Pos",GUILayout.Width(100));
	       	EditorGUILayout.LabelField("X "+script.measure_tool_terrain_point.x,GUILayout.Width(70));
	       	EditorGUILayout.LabelField("("+script.measure_tool_terrain_point_interpolated.x.ToString("F2")+")",GUILayout.Width(40));
	       	EditorGUILayout.EndHorizontal();
	       	
	       	EditorGUILayout.BeginHorizontal();
	       	GUILayout.Space(119);
	       	EditorGUILayout.LabelField("Y "+script.measure_tool_terrain_point.y,GUILayout.Width(70));
			EditorGUILayout.LabelField("("+script.measure_tool_terrain_point_interpolated.y.ToString("F2")+")",GUILayout.Width(40));
	       	EditorGUILayout.EndHorizontal();
	       	
	       	GUILayout.Space(5);
	       	
	       	EditorGUILayout.BeginHorizontal();
	       	GUILayout.Space(15);
	       	var locked: String;
	       	if (script.measure_tool_clicked){locked = " locked";}
	       	if (script.settings.color_scheme){GUI.color = Color.yellow;}
	       	EditorGUILayout.LabelField("Height",GUILayout.Width(100));
	       	EditorGUILayout.LabelField(""+height.ToString("F2"),GUILayout.Width(50));
	       	EditorGUILayout.LabelField("("+(height/heightmap_scale.y).ToString("F3")+")",GUILayout.Width(70));
	       	EditorGUILayout.LabelField(locked);
	       	EditorGUILayout.EndHorizontal();
	       	
	       	EditorGUILayout.BeginHorizontal();
	       	GUILayout.Space(15);
	       	if (script.settings.color_scheme){GUI.color = Color(0.85,0.85,0);}
	       	EditorGUILayout.LabelField("Steepness",GUILayout.Width(100));
	       	EditorGUILayout.LabelField(""+degree.ToString("F2"),GUILayout.Width(50));
	       	EditorGUILayout.LabelField("("+(degree/90).ToString("F3")+")",GUILayout.Width(70));
	       	EditorGUILayout.LabelField(locked);
	       	EditorGUILayout.EndHorizontal();  
	       	
	       	EditorGUILayout.BeginHorizontal();
	       	GUILayout.Space(15);
	       	if (script.settings.color_scheme){GUI.color = Color(0.7,0.7,0);}
	       	EditorGUILayout.LabelField("Normal",GUILayout.Width(100));
	       	EditorGUILayout.LabelField("("+normal.x.ToString("F2")+", "+normal.y.ToString("F2")+", "+normal.z.ToString("F2")+")",GUILayout.Width(124));
	       	EditorGUILayout.LabelField(locked);
	       	EditorGUILayout.EndHorizontal();  
	       	GUILayout.Space(10);
			
		  	if (script.settings.color_scheme){GUI.color = Color.cyan;}
	     					        		        	
	       	var splat_total: float = 0;
	       	
			for (var count_splat: int = 0;count_splat < splat_length;++count_splat)
			{	        		
	       		EditorGUILayout.BeginHorizontal();
	       		GUILayout.Space(15);
	       		EditorGUILayout.LabelField("Splat"+count_splat+"",GUILayout.Width(100));
	       		EditorGUILayout.LabelField(""+splat[0,0,count_splat].ToString("F3"),GUILayout.Width(50));
	       		splat_total += splat[0,0,count_splat];
	       		GUILayout.Space(74);
	       		EditorGUILayout.LabelField(locked);
	       		EditorGUILayout.EndHorizontal();  
	       	}
	       	
	       	GUILayout.Space(5);
	       	
	       	EditorGUILayout.BeginHorizontal();
	       	GUILayout.Space(15);
	       	if (script.settings.color_scheme){GUI.color = Color.cyan+Color(0.2,0.2,0.2);}
	       	EditorGUILayout.LabelField("Splat Total",GUILayout.Width(100));
	       	EditorGUILayout.LabelField(""+splat_total.ToString("F3"),GUILayout.Width(50));
	       	GUILayout.Space(74);
	       	EditorGUILayout.LabelField(locked);
	       	EditorGUILayout.EndHorizontal();  
	       	
	       	if (script.settings.color_scheme){GUI.color = Color.cyan-Color(0.3,0,3,0.3);}
			
			GUILayout.Space(5);
	       		      					        		        	
	       	var detail_total: float = 0;
	       	
			for (var count_detail: int = 0;count_detail < detail_length;++count_detail)
			{	        		
	       		EditorGUILayout.BeginHorizontal();
	       		GUILayout.Space(15);
	       		EditorGUILayout.LabelField("Detail"+count_detail+"",GUILayout.Width(100));
	       		EditorGUILayout.LabelField(""+detail[count_detail],GUILayout.Width(50));
	       		detail_total += detail[count_detail];
	       		GUILayout.Space(74);
	       		EditorGUILayout.LabelField(locked);
	       		EditorGUILayout.EndHorizontal();  
	       	}
	       	
	       	GUILayout.Space(5);
	       	
	       	EditorGUILayout.BeginHorizontal();
	       	GUILayout.Space(15);
	       	if (script.settings.color_scheme){GUI.color = Color.green;}
	       	EditorGUILayout.LabelField("Detail Total",GUILayout.Width(100));
	       	EditorGUILayout.LabelField(""+detail_total.ToString("F2"),GUILayout.Width(50));
	       	GUILayout.Space(74);
	       	EditorGUILayout.LabelField(locked); 
	       	EditorGUILayout.EndHorizontal();  
	       	
	       	GUILayout.Space(5);
	       	if (script.settings.color_scheme){GUI.color = Color.white;}
	       	
	       	EditorGUILayout.BeginHorizontal();
	       	GUILayout.Space(15);
	       	var range_text: String;
	       	if (script.measure_tool_inrange){range_text = "*";} else {range_text = "?";}
			EditorGUILayout.LabelField("Measure Range",GUILayout.Width(100));
			script.measure_tool_range = EditorGUILayout.Slider(script.measure_tool_range,1,100000,GUILayout.Width(300));
			EditorGUILayout.LabelField(range_text,GUILayout.Width(100));
			EditorGUILayout.EndHorizontal();  
			
			EditorGUILayout.BeginHorizontal();
	       	GUILayout.Space(15);
			EditorGUILayout.LabelField("Sphere Radius",GUILayout.Width(100));
			script.sphere_radius = EditorGUILayout.Slider(script.sphere_radius,0.1,50,GUILayout.Width(300));
			EditorGUILayout.EndHorizontal();  
			
			GUILayout.Space(5);
	       	EditorGUILayout.BeginHorizontal();
	       	GUILayout.Space(15);
			EditorGUILayout.LabelField("Sphere Gizmos",GUILayout.Width(100));
			script.sphere_draw = EditorGUILayout.Toggle(script.sphere_draw,GUILayout.Width(25));	        	      
			EditorGUILayout.EndHorizontal(); 
			
			GUILayout.Space(5);
	       	EditorGUILayout.BeginHorizontal();
	       	GUILayout.Space(15);
			EditorGUILayout.LabelField("Converter Calculator");
			EditorGUILayout.EndHorizontal(); 
			
	       	EditorGUILayout.BeginHorizontal();
	       	GUILayout.Space(15);
			EditorGUILayout.LabelField("Height",GUILayout.Width(100));
			gui_changed_old = GUI.changed;
			GUI.changed = false;
			script.measure_tool_converter_height_input = EditorGUILayout.FloatField(script.measure_tool_converter_height_input,GUILayout.Width(80));	        	      
			if (GUI.changed)
			{
				if (terrain_measure){script.measure_tool_converter_height = script.measure_tool_converter_height_input/terrain_measure.terrainData.size.y;}
			}
			EditorGUILayout.LabelField("-> "+script.measure_tool_converter_height.ToString("f3"));
			GUI.changed = gui_changed_old;
			EditorGUILayout.EndHorizontal(); 
			
			EditorGUILayout.BeginHorizontal();
	       	GUILayout.Space(15);
			EditorGUILayout.LabelField("Steepness",GUILayout.Width(100));
			gui_changed_old = GUI.changed;
			GUI.changed = false;
			script.measure_tool_converter_angle_input = EditorGUILayout.FloatField(script.measure_tool_converter_angle_input,GUILayout.Width(80));	        	      
			if (GUI.changed)
			{
				script.measure_tool_converter_angle = script.measure_tool_converter_angle_input/90;
			}
			EditorGUILayout.LabelField("-> "+script.measure_tool_converter_angle.ToString("f3"));
			GUI.changed = gui_changed_old;
			EditorGUILayout.EndHorizontal(); 
			
			if (script.measure_tool_active && !script.measure_tool_undock){this.Repaint();}
       	}
	}	
}