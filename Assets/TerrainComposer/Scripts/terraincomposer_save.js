#pragma strict
import System.Collections.Generic;
import System;
import System.IO;
import System.Text.RegularExpressions;

enum filter_devices_enum{Standard,Math};
enum condition_type_enum{Height,Steepness,Direction,Image,Random,RandomRange,Always,Current,MaxCount,RawHeightmap} 
enum device2_type_enum{Sin,Cos}
enum condition_output_enum{add = 0,subtract = 1,change = 2,multiply = 3,devide = 4,difference = 5,average = 6,max = 7,min = 8}
enum subfilter_output_enum{max,min,average,add,subtract}
enum condition_select_output{normal,stretch}
enum change_mode_enum{filter,layer}
enum smooth_method_enum{lerp,smoothstep,clamp}
enum subfilter_mode_enum{strength,smooth,lerp}
enum layer_output_enum{heightmap,color,splat,tree,grass,object}
enum list_condition_enum{Terrain,Random}
enum resolution_mode_enum{Automatic,Heightmap,Splatmap,Tree,Detailmap,Object,Units,Custom}
enum rotation_mode_enum{Local,World}
enum distance_mode_enum{Radius,Square}
enum distance_level_enum{This,Layer,LayerLevel,Global}
enum mix_mode_enum{Group,Single}
enum object_mode_enum{SinglePlacement,LinePlacement}
enum image_mode_enum{Terrain,MultiTerrain,Area}
enum raw_mode_enum{Windows,Mac}
enum export_mode_enum{Image,Raw}
enum curve_type_enum{Normal,Random,Perlin}
enum select_mode_enum {free,select}

var Combine_Children: GameObject;
var software_version: String = "Beta";
var software_id: float;
var filename: String;

var heightmap_resolution_list: String[] = ["4097","2049","1025","513","257","129","65","33"];
var splatmap_resolution_list: String[] = ["2048","1024","512","256","128","64","32","16"];
var detailmap_resolution_list: String[] = ["2048","1024","512","256","128","64","32","16","8"];
var detail_resolution_per_patch_list: String[] = ["8","16","32","64","128"];

var trees: TreeInstance[];
var tree_number:int = 0;

var subfilter: List.<subfilter_class> = new List.<subfilter_class>();
var filter: List.<filter_class> = new List.<filter_class>(); 
var script: terraincomposer_save;
var show_prelayer: int = 0;
var prelayers: List.<prelayer_class> = new List.<prelayer_class>();
var prelayer: prelayer_class;
var prelayer_stack: List.<int> = new List.<int>();
var area_stack: List.<Rect> = new List.<Rect>();
var area_stack_enabled: boolean = false;
var area_skip: boolean;
var count_area: int;
var layer_count: boolean = true;
var placed_count: boolean = true;

var layer_heightmap: int;
var layer_color: int;
var layer_splat: int;
var layer_tree: int;
var layer_grass: int;
var layer_object: int;
var layer_heightmap_foldout: boolean = false;
var layer_color_foldout: boolean = false;
var layer_splat_foldout: boolean = false;
var layer_tree_foldout: boolean = false;
var layer_grass_foldout: boolean = false;
var layer_object_foldout: boolean = false;

var current_layer: layer_class;
var current_filter: filter_class;
var current_subfilter: subfilter_class;

var terrain_text: String = "Terrain:";
var terrains: List.<terrain_class> = new List.<terrain_class>();
var raw_path: String = String.Empty;
var raw_save_path: String = String.Empty;
var terrains_foldout: boolean = true;
var terrains_active: boolean = true;
var terrains_foldout2: boolean = true;
var remarks: remarks_class = new remarks_class();
var terrain_instances: int = 1;
var terrain_asset_erase: boolean = false;
var terrain_tiles: int = 1;
var terrain_path: String;
var terrain_parent: Transform;
var terrain_scene_name: String = "Terrain";
var terrain_asset_name: String = "New Terrain";

var swap_color_range_select: boolean = false;
var swap_color_range_number: int;
var swap_precolor_range: precolor_range_class;
var copy_color_range_select: boolean = false;
 
var swap_tree_select: boolean = false;
var swap_tree1: tree_class;
var swap_tree_output: tree_output_class;
var swap_tree_position: int;
var copy_tree_select: boolean = false;
var copy_tree1: tree_class;

var swap_object_select: boolean = false;
var swap_object_output: object_output_class;
var swap_object_number: int;
var copy_object_select: boolean = false;

var swap_description_select: boolean = false;
var swap_description_prelayer_index: int;
var swap_description_position: int;
var copy_description_select: boolean = false;
var copy_description_prelayer_index: int;
var copy_description_position: int;

var swap_layer_select: boolean = false;
var swap_prelayer_index: int;
var swap_layer_index: int;
var copy_layer_select: boolean = false;
var copy_prelayer_index: int;
var copy_layer_index: int;

var swap_filter_select: boolean = false;
var copy_filter_select: boolean = false;
    
var swap_subfilter_select: boolean = false;
var swap_presubfilter: presubfilter_class;
var swap_subfilter_index: int;
var copy_subfilter_select: boolean = false;
var copy_subfilter1: subfilter_class;

var preterrain: terrain_class;

var mix: float;
var xx: float = 0;
var zz: float = 0;
var resolution: float = 2048;
var splat_plus = 1;
var Rad2Deg:float = Mathf.Rad2Deg;

var splat1: SplatPrototype = new SplatPrototype();

var count_value: int;
var count_color_range: int;
var count_prelayer: int;
var count_layer: int;
var count_tree: int;
var count_object: int;
var count_filter: int;
var count_subfilter: int;
var call_from: int;
var random_range: float;
var random_range2: float;
var color1: Color;
var color2: Color;
var color_r: float;
var color_g: float;
var color_b: float;
var color_a: float;

var heightmap_output: boolean = true;
var heightmap_output_layer: boolean = false;
var color_output: boolean = true;
var splat_output: boolean = true;
var tree_output: boolean = true;
var grass_output: boolean = true;
var object_output: boolean = true;
var line_output: boolean = false;

var button1: boolean;
var button_export: boolean;

var button_generate_text: String = "Generate";
  
var export_texture: Texture2D;
var export_bytes: byte[];
var export_file: String = "";
var export_path: String;
var export_name: String;
var export_color_advanced: boolean = true;
var export_color: Color = Color.white;
var export_color_curve_advanced: boolean = false;
var export_color_curve: AnimationCurve = new AnimationCurve.Linear(0,0,1,1);
var export_color_curve_red: AnimationCurve = new AnimationCurve.Linear(0,0,1,1);
var export_color_curve_green: AnimationCurve = new AnimationCurve.Linear(0,0,1,1);
var export_color_curve_blue: AnimationCurve = new AnimationCurve.Linear(0,0,1,1);

// generate 
var generate: boolean = false;  
var generate_manual: boolean = false;
var generate_step: int = 1;
var generate_speed_display: boolean = false;
var generate_sub_break: boolean = false;
var generate_pause: boolean = false; 
var generate_call_time: float;
var generate_call_time2: float;
var generate_call_delay: float;
var generate_time: float;
var generate_time_start: float;
var generate_on_top: boolean = true;
var generate_world_mode: boolean = false;
var generate_auto: boolean = false;
var generate_auto_mode: int = 1;
var generate_auto_delay1: float = 0;
var generate_auto_delay2: float = 0.2;
var generate_call: boolean = false;
var generate_error: boolean = false;
var only_heightmap: boolean = false;
var terrain_index_old: int = -1;
var tree_color: Color;
var layer_x: float;
var layer_y: float;
var unload_textures: boolean = true;
var clean_memory: boolean = true;
var splat_total: float;
var objects_placed: List.<distance_class> = new List.<distance_class>();
var object_info: distance_class = new distance_class();

var heightmap_x: int;
var heightmap_y: int;
var heightmap_x_old: int;
var heightmap_y_old: int;
var detailmap_x: int;
var detailmap_y: int;
var h_local_x: int;
var h_local_y: int;
var map_x: int;
var map_y: int;

var measure_normal: boolean = false;

var erosion_list: List.<erosion> = new List.<erosion>();
var erosion_move: boolean = false;

var place: boolean = true;
var position: Vector3;
var scale: Vector3;
var height: float;
var height_interpolated: float;		
var degree: float;
var normal: Vector3;

var local_x_rot: float;
var local_y_rot: float;
var local_x: float;
var local_y: float;
var a: float;
var b: float;

var random: System.Random = new System.Random();

var measure_tool: boolean = false;
var measure_tool_foldout: boolean = true;
var measure_tool_active: boolean = false;
var measure_tool_undock: boolean = false;
var measure_tool_clicked: boolean = false;
var measure_tool_range: float = 10000;
var measure_tool_inrange: boolean;
var measure_tool_terrain_point: Vector2;
var measure_tool_terrain_point_interpolated: Vector2;
var measure_tool_converter_foldout: boolean = false;
var measure_tool_converter_height_input: float;
var measure_tool_converter_height: float;
var measure_tool_converter_angle_input: float;
var measure_tool_converter_angle: float;

var stitch_tool: boolean = true;
var stitch_tool_foldout: boolean = true;
var stitch_tool_border_influence: float = 20;
var stitch_tool_curve: AnimationCurve = new AnimationCurve.Linear(0,0,1,1);
var stitch_tool_strength: float = 1;
var stitch_command: boolean = false;

var smooth_tool: boolean = true;
var smooth_tool_foldout: boolean = true;
var smooth_tool_strength: float = 1;
var smooth_tool_repeat: int = 1;
var smooth_tool_layer_strength: float = 1;
var smooth_command: boolean = false;
var smooth_tool_terrain: String[];
var smooth_tool_terrain_select: int;

var quick_tools: boolean = true;
var quick_tools_foldout: boolean = false;

var slice_tool: boolean = true;
var slice_tool_active: boolean = false;
var slice_tool_foldout: boolean = true;
var slice_tool_rect: Rect;
var slice_tool_terrain: Terrain;
var slice_tool_offset: Vector2 = new Vector2();
var slice_tool_min_height: float = 0;

var sphere_draw: boolean = true;
var sphere_radius: float = 10;
var measure_tool_point_old: Vector3;
var image_tools: boolean = false;
var texture_tool: texture_tool_class = new texture_tool_class();
var pattern_tool: pattern_tool_class = new pattern_tool_class();
var heightmap_tool: heightmap_tool_class = new heightmap_tool_class();

var description_display: boolean = true;
var description_space: float = 15;
var curve_in_memory_old: animation_curve_class;

var meshcapture_tool: boolean = true;
var meshcapture_tool_foldout: boolean = true;
var meshcapture_tool_object: GameObject;
var meshcapture_tool_pivot: Transform;
var meshcapture_tool_image_width: int = 128;
var meshcapture_tool_image_height: int = 128;
var meshcapture_tool_scale: float = 1;
var meshcapture_tool_save_scale: boolean = true;
var meshcapture_tool_shadows: boolean = false;
var meshcapture_tool_color: Color = Color.white;
var meshcapture_background_color: Color = Color.black;

var break_x_step: int = 3;
var row_object_count: int = 0;
var break_x: boolean = false;
var break_time: float = 0.2;
var break_time_set: float;
var generate_settings: boolean = false;
var generate_settings_foldout: boolean = true;

var tile_resolution: int = 1000;

var trees_maximum: int = 1000;

var script_base: terraincomposer_save;
var tc_id: int;
var settings: settings_class = new settings_class();

@HideInInspector
var filter_value: float;
@HideInInspector
var filter_strength: float;
@HideInInspector
var filter_input: float;
@HideInInspector
var subfilter_value: float;

@HideInInspector
var byte_hi2: int;
@HideInInspector
var byte_hi: int;
@HideInInspector
var byte_lo: int;
var raw_files: List.<raw_file_class> = new List.<raw_file_class>();
var converted_resolutions: boolean = false;
var converted_version: float = 0;

class remarks_class
{
	var textfield_foldout: boolean = false;
	var textfield_length: int = 1;
	var textfield: String = String.Empty;
}

class raw_file_class
{
	var assigned: boolean = false;
	var created: boolean = true;
	var file: String = String.Empty;
	var filename: String = String.Empty;
	var mode: raw_mode_enum;
	var length: int;
	var resolution: int;
	var loaded: boolean = false;
	
	var linked: boolean = true;
	
	var bytes: byte[];
	
	function exists(): boolean
	{
		var file_info: FileInfo = new FileInfo(file);
	
		if (file_info.Exists){return true;} else {return false;}
	}
	
	function save(preterrain1: terrain_class)
	{
		if (!preterrain1.terrain){return;}
		
		var resolution: float = preterrain1.terrain.terrainData.heightmapResolution;
		
		bytes = new byte[resolution*resolution*2];
		
		preterrain1.heights = preterrain1.terrain.terrainData.GetHeights(0,0,resolution,resolution);
		
		var count_x: int = 0;
		var count_y: int = 0;
		var byte_hi: int;
		var byte_lo: int;
		var i: int = 0;
		var value_int: ushort;
		var height: float;
		    	    	    	    	    	    	    	    	    	    	    	    	
	    if (mode == raw_mode_enum.Mac)
	    {
		   	for (count_x = 0;count_x < resolution;++count_x) 
		   	{
				for (count_y = 0;count_y < resolution;++count_y) 
				{
					height = preterrain1.heights[count_x,count_y]*65535;
	
					value_int = height;
					
					byte_hi = value_int >> 8;
					byte_lo = value_int-(byte_hi << 8);
					
					bytes[i++] = byte_hi;
					bytes[i++] = byte_lo;
				}
			}
		}
				
		else if (mode == raw_mode_enum.Windows)
		{
			for (count_x = 0;count_x < resolution;++count_x) 
		   	{
				for (count_y = 0;count_y < resolution;++count_y) 
				{
					height = preterrain1.heights[count_x,count_y]*65535;
	
					value_int = height;
					
					byte_hi = value_int >> 8;
					byte_lo = value_int-(byte_hi << 8);
					
					bytes[i++] = byte_lo;
					bytes[i++] = byte_hi;
				}
			}
		}
		
		File.WriteAllBytes(file+".raw",bytes);
		preterrain1.heights = new float[0,0];
		bytes = new byte[0];
	}
}

class raw_class
{
	var foldout: boolean = true;
	var settings_foldout: boolean = false;
	var raw_number: int = 0;
	var file_index: List.<int> = new List.<int>();
	var file_foldout: List.<boolean> = new List.<boolean>();
	var path: String = String.Empty;
	var tile_offset: boolean = false;
	var flip_x: boolean = false;
	var flip_y: boolean = false;
	var clamp: boolean = false;
	var list_length: int = 1;
	var list_row: int = 4;
	var display_short_list: boolean = false;
	var raw_list_mode: list_condition_enum;
	var raw_mode: image_mode_enum;
	var object: Object;
	
	var auto_search: auto_search_class = new auto_search_class();
	
	var raw_auto_scale: boolean = true;
	var conversion_step: Vector2 = Vector2(1,1);
	var tile_x: float = 1;
	var tile_y: float = 1;
	var tile_link: boolean = false;
	var tile_offset_x: float = 0;
	var tile_offset_y: float = 0;
	var rgb: boolean = true;
	var rotation: boolean = false;
	var rotation_value: float = 0;
	var output: boolean;
	var output_pos: float;
	
	function raw_class()
	{
		file_index.Add(-1);
		file_foldout.Add(true);
	}
	
	function adjust_list()
	{
		var delta_list: int = list_length-file_index.Count;
		var count_file_index: int;
		
		if (delta_list > 0)
		{
			for (count_file_index = 0;count_file_index < delta_list;++count_file_index)
			{
				file_index.Add(-1);
				file_foldout.Add(false);		
			}
		}
		if (delta_list < 0)
		{
			delta_list *= -1;
			for (count_file_index = 0;count_file_index < delta_list;++count_file_index)
			{
				file_index.RemoveAt(file_index.Count-1);
				file_foldout.RemoveAt(file_foldout.Count-1);
			}
		}
	}

	
	function set_raw_auto_scale(preterrain1: terrain_class,area: Rect,raw_files: List.<raw_file_class>,raw_number: int)
	{
		if (raw_number < file_index.Count)
		{
			if (raw_files[file_index[raw_number]].assigned && preterrain1)
			{
				if (raw_mode == image_mode_enum.Area)
				{
					conversion_step.x = area.width/raw_files[file_index[raw_number]].resolution;
					conversion_step.y = area.height/raw_files[file_index[raw_number]].resolution;
				}
				else if (raw_mode == image_mode_enum.Terrain)
				{
					if (preterrain1.terrain)
					{
						conversion_step.x = preterrain1.terrain.terrainData.size.x/raw_files[file_index[raw_number]].resolution;
						conversion_step.y = preterrain1.terrain.terrainData.size.z/raw_files[file_index[raw_number]].resolution;
					}
				}
				else if (raw_mode == image_mode_enum.MultiTerrain)
				{
					conversion_step.x = (preterrain1.terrain.terrainData.size.x*preterrain1.tiles.x)/raw_files[file_index[raw_number]].resolution;
					conversion_step.y = (preterrain1.terrain.terrainData.size.z*preterrain1.tiles.y)/raw_files[file_index[raw_number]].resolution;
				}
			}
		}
	}
}

// terrain_class
class terrain_class
{
	var active: boolean = true;
	var foldout: boolean = false;
	var index: int;
	var index_old: int;
	var on_row: boolean = false;
	var color_terrain: Color = Color(2,2,2,1);
	var copy_terrain: int = 0;
	var copy_terrain_settings: boolean = true;
	
	var splat_alpha: Texture2D[];
	
	var terrain: Terrain;
	var parent: Transform;
	var name: String;
	var prearea: area_class = new area_class();
	var map: float[,,];
	var grass_detail: detail_class[];
	var heights: float[,];
	var splatPrototypes: List.<splatPrototype_class> = new List.<splatPrototype_class>();
	var colormap: splatPrototype_class = new splatPrototype_class();
	var splats_foldout: boolean = false;
	var treePrototypes: List.<treePrototype_class> = new List.<treePrototype_class>();
	var trees_foldout: boolean = false;
	var detailPrototypes: List.<detailPrototype_class> = new List.<detailPrototype_class>();
	var details_foldout: boolean = false;
	var tree_instances: List.<TreeInstance> = new List.<TreeInstance>();
	var splat: float[];
	var splat_layer: float[];
	var grass: float[];
	
	var heightmap_resolution_list: int;
	var splatmap_resolution_list: int;
	var basemap_resolution_list: int;
	var detailmap_resolution_list: int;
	var detail_resolution_per_patch_list: int;
	
	var size: Vector3;
	var tile_x: float;
	var tile_z: float;
	var tiles: Vector2 = Vector2(1,1);
	var rect: Rect;
	
	var data_foldout: boolean = true;
	var scale: Vector3;
	
	var maps_foldout: boolean = false;
	
	var settings_foldout: boolean = false;
	var resolution_foldout: boolean = false;
	var scripts_foldout: boolean = false;
	var reset_foldout: boolean = false;
	var size_foldout: boolean = false;
	
	var raw_file_index: int = -1;
	var raw_save_file: raw_file_class = new raw_file_class();
	
	// resolutions
	var heightmap_resolution: float = 256;
	var splatmap_resolution: float = 256;
	var detail_resolution: float = 256;
	var detail_resolution_per_patch: float = 8;
	var basemap_resolution: float = 256;
	
	var size_synchronous: boolean = true;
	var resolutions_synchronous: boolean = true;
	var splat_synchronous: boolean = true;
	var tree_synchronous: boolean = true;
	var detail_synchronous: boolean = true;
	
	var splatmap_conversion: Vector2;
	var heightmap_conversion: Vector2;
	var detailmap_conversion: Vector2;
	
	var splat_foldout: boolean = false;
	var splat_length: int;
	
	var tree_foldout: boolean = false;
	var tree_length: int;
	
	var detail_foldout: boolean = false;
	var detail_scale: float = 1;
	
	var base_terrain_foldout: boolean = true;
	var tree_detail_objects_foldout: boolean = true;
	var wind_settings_foldout: boolean = true;
	
	var settings_all_terrain: boolean = true;
	var heightmapPixelError: float = 5;
	var heightmapMaximumLOD: int = 0;
	var castShadows: boolean = false;
	var basemapDistance: float = 20000;
	var treeDistance: float = 20000;
	var detailObjectDistance: float = 250;
	var detailObjectDensity: float = 1;
	var treeMaximumFullLODCount: int = 50;
	var treeBillboardDistance: float = 250;
	var treeCrossFadeLength: float = 200;
	var draw: boolean = true;
	var editor_draw: boolean = true;
	
	var script_terrainDetail: TerrainDetail;
	var script_triplanar: TriPlanarTerrainScript;
	
	var settings_runtime: boolean = false;
	var settings_editor: boolean = true;
	
	var wavingGrassSpeed: float = 0.5;
	var wavingGrassAmount: float = 0.5;
	var wavingGrassStrength: float = 0.5;
	var wavingGrassTint: Color = Color(0.698,0.6,0.50);
	
	function add_splatprototype(splat_number: int)
	{
		splatPrototypes.Insert(splat_number,new splatPrototype_class());
	}
	
	function erase_splatprototype(splat_number: int)
	{
	 	if (splatPrototypes.Count > 0){splatPrototypes.RemoveAt(splat_number);}
	}
	
	function clear_splatprototype()
	{
		splatPrototypes.Clear();
	}
	
	function add_treeprototype(tree_number: int)
	{
		treePrototypes.Insert(tree_number,new treePrototype_class());
	}
	
	function erase_treeprototype(tree_number: int)
	{
	 	if (treePrototypes.Count > 0){treePrototypes.RemoveAt(tree_number);}
	}
	
	function clear_treeprototype()
	{
		treePrototypes.Clear();
	}
	
	function add_detailprototype(detail_number: int)
	{
		detailPrototypes.Insert(detail_number,new detailPrototype_class());
	}
	
	function erase_detailprototype(detail_number: int)
	{
	 	if (detailPrototypes.Count > 0){detailPrototypes.RemoveAt(detail_number);}
	}
	
	function clear_detailprototype()
	{
		detailPrototypes.Clear();
	}
}

class splatPrototype_class
{
	var foldout: boolean = false;
	var texture: Texture2D;
	var tileSize: Vector2 = Vector2(10,10);
	var tileSize_link: boolean = true;
	var tileSize_old: Vector2;
	var tileOffset: Vector2 = Vector2(0,0);
	
	var normal_tileSize: Vector2 = Vector2(-1,-1);
	var strength: float = -1;
    var strength_splat: float = -1;
    var normal_texture: Texture2D;
	var specular_texture: Texture2D;	
}

class treePrototype_class
{
	var prefab: GameObject;
	var texture: Texture2D;
	var bendFactor: float = 0.3;
	var foldout: boolean = false;
}

class detailPrototype_class
{
	var foldout: boolean = false;
	var prototype: GameObject;
	var prototypeTexture: Texture2D;
	var minWidth: float = 1;
	var maxWidth: float = 2;
	var minHeight: float = 1;
	var maxHeight: float = 2;
	var noiseSpread: float = 0.1;
	var bendFactor: float;
	var healthyColor: Color = Color.white;
	var dryColor: Color = Color(0.8,0.76,0.53);
	var renderMode: DetailRenderMode = DetailRenderMode.Grass;
}

// area_class
class area_class
{
	var active: boolean = true;
	var foldout: boolean = false;
	var area: Rect;
	var area_old: Rect;
	var area_max: Rect;
	var center: Vector2;
	var image_offset: Vector2;
	var rotation: Vector3;
	var rotation_active: boolean = false;
	var link_start: boolean = true;
	var link_end: boolean = true;
	
	var resolution: float;
	var custom_resolution: float;
	var step: Vector2;
	var step_old: Vector2;
	var conversion_step: Vector2;
	var resolution_mode: resolution_mode_enum = resolution_mode_enum.Automatic;
	var resolution_mode_text: String;
	var resolution_tooltip_text: String;
	
	var tree_resolution: int = 512;
	var object_resolution: int = 512;
	var tree_resolution_active: boolean = false;
	var object_resolution_active: boolean = false;
	
	function max()
	{
		area = area_max;
	}
	
	function round_area_to_step(area1: Rect): Rect
	{
		area1.xMin = Mathf.Round(area1.xMin/step.x)*step.x;
		area1.xMax = Mathf.Round(area1.xMax/step.x)*step.x;
		area1.yMin = Mathf.Round(area1.yMin/step.y)*step.y;
		area1.yMax = Mathf.Round(area1.yMax/step.y)*step.y;
		
		return area1;
	}
	
	function set_resolution_mode_text()
	{
		if (area == area_max)
		{
			resolution_mode_text = "M";
			resolution_tooltip_text = "Maximum Area Selected";
		} 
		else 
		{
			resolution_mode_text = "C";
			resolution_tooltip_text = "Custum Area Selected";
		}
		
		if (resolution_mode == resolution_mode_enum.Automatic){resolution_mode_text += "-> A";resolution_tooltip_text += "\n\nStep Mode is on Automatic";}
		else if (resolution_mode == resolution_mode_enum.Heightmap){resolution_mode_text += "-> H";resolution_tooltip_text += "\n\nStep Mode is on Heightmap";}
		else if (resolution_mode == resolution_mode_enum.Splatmap){resolution_mode_text += "-> S";resolution_tooltip_text += "\n\nStep Mode is on Splatmap";}
		else if (resolution_mode == resolution_mode_enum.Detailmap){resolution_mode_text += "-> D";resolution_tooltip_text += "\n\nStep Mode is on Detailmap";}
		else if (resolution_mode == resolution_mode_enum.Tree){resolution_mode_text += "-> T";resolution_tooltip_text += "\n\nStep Mode is on Tree";}
		else if (resolution_mode == resolution_mode_enum.Object){resolution_mode_text += "-> O";resolution_tooltip_text += "\n\nStep Mode is on Object";}
		else if (resolution_mode == resolution_mode_enum.Units){resolution_mode_text += "-> U";resolution_tooltip_text += "\n\nStep Mode is on Units";}
		else if (resolution_mode == resolution_mode_enum.Custom){resolution_mode_text += "-> C";resolution_tooltip_text += "\n\nStep Mode is on Custom";}
	}
}

// predescription_class
class predescription_class
{
	var description: List.<description_class> = new List.<description_class>();
	var description_enum: String[];
	var description_position: int = 0;
	var layer_index: int;
	var description_index: int;
	
	function predescription_class()
	{
		description.Add(new description_class());
		set_description_enum();	
	}
	
	function add_description(description_number: int)
	{
		description.Insert(description_number,new description_class());
	}
	
	function erase_description(description_number: int)
	{
		if (description.Count > 1)
		{
			description.RemoveAt(description_number);
			set_description_enum();
			if (description_position > description_enum.Length-1){description_position = description_enum.Length-1;}
		}
	}
	
	function add_layer_index(layer_number: int,layer_index: int,description_number: int)
	{
		move_layer_index(layer_number,1);
		description[description_number].layer_index.Insert(layer_index,layer_number);
	}
	
	function erase_layer_index(layer_number: int,layer_index: int,description_number: int)
	{
		move_layer_index(layer_number,-1);
		description[description_number].layer_index.RemoveAt(layer_index);
	}
	
	function move_layer_index(layer_number: int,direction: int)
	{
		for (var count_description: int = 0;count_description < description.Count;++count_description)
		{
			for (var count_layer: int = 0;count_layer < description[count_description].layer_index.Count;++count_layer)
			{
				if (description[count_description].layer_index[count_layer] >= layer_number)
				{
						description[count_description].layer_index[count_layer] += direction;
				}
			}
		}
	}
	
	function search_layer(layer_number: int)
	{
		for (var count_description: int = 0;count_description < description.Count;++count_description)
		{
			for (var count_layer: int = 0;count_layer < description[count_description].layer_index.Count;++count_layer)
			{
				if (description[count_description].layer_index[count_layer] == layer_number)
				{
					description_index = count_description;
					layer_index = count_layer;
					return;
				}
			}
		}
		description_index = -1;
		layer_index = -1;
	}
	
	function set_description_enum()
	{
		description_enum = new String[description.Count];
		
		for (var count_description: int = 0;count_description < description.Count;++count_description)
		{
			description_enum[count_description] = description[count_description].text;			
		}
	}
}

// description class
class description_class
{
	var foldout: boolean = true;
	var text: String = "Root";
	var remarks: remarks_class = new remarks_class();
	var edit: boolean = false;
	var disable_edit: boolean = false;
	var menu_rect: Rect;
	var rect: Rect;
	var layer_index: List.<int> = new List.<int>();
	var layers_active: boolean = true;
	var layers_foldout: boolean = true;
	var swap_text = "S";
	var swap_select = false;
	var copy_select = false;
}

// prelayer_class
class prelayer_class 
{
	var foldout: boolean = true;
	var linked: boolean = true;
	var remarks: remarks_class = new remarks_class();
	var interface_display_layergroup: boolean = false;
	var interface_display_layer: boolean = true;
	var layers_foldout: boolean = true;
	var layers_active: boolean = true;
	var index: int = 0;
	var level: int = 0;
	var layer: List.<layer_class> = new List.<layer_class>();
	var predescription: predescription_class = new predescription_class();
	
	var layer_text: String = "Layer(1):";
	
	var layer_output: layer_output_enum;
	var view_menu_rect: Rect;
	
	var view_heightmap_layer: boolean = true;
	var view_color_layer: boolean = true;
	var view_splat_layer: boolean = true;
	var view_tree_layer: boolean = true;
	var	view_grass_layer: boolean = true;
	var view_object_layer: boolean = true;
	var view_only_selected: boolean = false;
	
	var x: float;
	var y: float;
	var counter_y: float;
	var count_terrain: int;
	var break_x_value: float;
	
	// area
	var prearea: area_class = new area_class();
	var area: boolean = false;
	
	var objects_placed: List.<distance_class> = new List.<distance_class>();
	
	function prelayer_class(length: int,index2: int)
	{
		index = index2;
		if (length > 0)
		{
			for (var counter: int = 0;counter < length;++counter)
			{
				layer.Add(new layer_class());
			 	layer[0].output = layer_output_enum.splat;
				predescription.add_layer_index(counter,counter,0);
			}	
		}
	}
	
	function set_prelayer_text()
	{
		layer_text = "Layer Level"+index+"("+layer.Count+")";
	}
	
	function new_layer(layer_number: int,filter: List.<filter_class>)
	{
		layer[layer_number] = new layer_class();
	}

	function change_layers_active_from_description(description_number: int,invert: boolean)
	{
		for (var count_layer: int = 0;count_layer < predescription.description[description_number].layer_index.Count;++count_layer)
		{
			if (!invert)
			{
				layer[predescription.description[description_number].layer_index[count_layer]].active = predescription.description[description_number].layers_active;
			}
			else
			{
				layer[predescription.description[description_number].layer_index[count_layer]].active = !layer[predescription.description[description_number].layer_index[count_layer]].active;
			}
		}
	}
	
	function change_layers_foldout_from_description(description_number: int,invert: boolean)
	{
		for (var count_layer: int = 0;count_layer < predescription.description[description_number].layer_index.Count;++count_layer)
		{
			if (!invert)
			{
				layer[predescription.description[description_number].layer_index[count_layer]].foldout = predescription.description[description_number].layers_foldout;
			}
			else
			{
				layer[predescription.description[description_number].layer_index[count_layer]].foldout = !layer[predescription.description[description_number].layer_index[count_layer]].foldout;
			}
		}
	}
	
	function change_layers_active(invert: boolean)
	{
		for (var count_layer: int = 0;count_layer < layer.Count;++count_layer)
		{
			if (!invert)
			{
				layer[count_layer].active = layers_active;
			}
			else
			{
				layer[count_layer].active = !layer[count_layer].active;
			}
		}
	}
	
	function change_foldout_layers(invert: boolean)
	{
		for (var count_layer: int = 0;count_layer < layer.Count;++count_layer)
		{
			if (!invert)
			{
				layer[count_layer].foldout = layers_foldout;
			}
			else
			{
				layer[count_layer].foldout = !layer[count_layer].foldout;
			}
		}
	}
	
	function swap_layer2(number1: int,number2: int)
	{
		var layer2: layer_class = layer[number1];
		layer[number1] = layer[number2];
		layer[number2] = layer2;
		if (layer[number1].color_layer[0] < 1.5){layer[number1].color_layer += Color (1,1,1,1);}
		if (layer[number2].color_layer[0] < 1.5){layer[number2].color_layer += Color (1,1,1,1);}
	}
}

// layer_class
class layer_class 
{
	var software_id: float = 0;
	var active: boolean = true; 
	var foldout: boolean = false;
	var color_layer: Color = Color(1.5,1.5,1.5,1);
	var output: layer_output_enum = layer_output_enum.color;
	var strength: float = 1;

	// perlin
	var zoom: float = 1;
	var offset: Vector2;
	var offset_range: Vector2 = Vector2(5,5);
	var offset_middle: Vector2;

	var drawn: boolean = false;
	var text: String = String.Empty;
	var text_placed: String = String.Empty;
	var rect: Rect;
	var edit: boolean = false;
	var disable_edit: boolean = false;
	var stitch: boolean = false;
	var smooth: boolean = false;
	var remarks: remarks_class = new remarks_class();
	
	var height_output: height_output_class = new height_output_class();
	var color_output: color_output_class = new color_output_class(); 
	var splat_output: splat_output_class = new splat_output_class();
	var tree_output: tree_output_class = new tree_output_class();
	var grass_output: grass_output_class = new grass_output_class();
	var object_output: object_output_class = new object_output_class();
	
	var menu_rect: Rect;
	
	var swap_text: String = "S";
	var swap_select: boolean = false;
	var copy_select: boolean = false;
	var prefilter: prefilter_class = new prefilter_class();
	
	var objects_placed: List.<distance_class> = new List.<distance_class>();
	
	function layer_class()
	{
		object_output = new object_output_class();
	}
}

// height 
class height_output_class
{
	var stitch: boolean = false;
	var value: float;
	var strength: float = 1;
}
	
// color
class color_output_class
{
	var active: boolean; 
	var foldout: boolean = true;
	var strength: float = 1;
	var precolor_range_enum: String[] = new String[1];
	var precolor_range: List.<precolor_range_class> = new List.<precolor_range_class>();
	var color_text: String = "Color Outputs:";
	
	function color_output_class()
	{
		precolor_range.Add(new precolor_range_class(1,true));
		set_precolor_range_enum();
	}
	
	function set_precolor_range_enum()
	{
		precolor_range_enum = new String[precolor_range.Count];
		for (var count_precolor_range: int = 0;count_precolor_range < precolor_range.Count;++count_precolor_range)
		{
			precolor_range_enum[count_precolor_range] = "Color Range"+count_precolor_range;
		}
	}
	
	function set_precolor_range_length(length_new: int)
	{
		if (length_new != precolor_range.Count)
		{
		    if (length_new > precolor_range.Count)
		    {
		    	precolor_range.Add(new precolor_range_class(1,true));
		    	precolor_range[precolor_range.Count-1].index = length_new-1;
		    	precolor_range[precolor_range.Count-1].set_color_range_text();
		    } 
		    else 
		    {
		    	precolor_range.RemoveAt(precolor_range.Count-1);
		    }
		    set_precolor_range_enum();
		}
	} 
	
	function add_precolor_range(precolor_range_number: int)
	{
		precolor_range.Insert(precolor_range_number,new precolor_range_class(1,true));
		precolor_range[precolor_range_number].index = precolor_range_number;
		precolor_range[precolor_range_number].set_color_range_text();
	}
	
	function erase_precolor_range(precolor_range_number: int)
	{
		precolor_range.RemoveAt(precolor_range_number);
		set_precolor_range_enum();
	}
}

// color_range_class
class color_range_class 
{
	var color_color_range: Color = Color(2,2,2,1);
	var color_start: Color = Color(0,0,0,1);
	var color_end: Color = Color(0,0,0,1);
	var one_color: boolean = false;
	var curve_menu_rect: Rect;
	var invert: boolean = false;
	var swap_text: String = "S";
	var swap_select: boolean = false;
	var copy_select: boolean = false;
	var output: float = 1;
	var select_output: int;
	var precurve: animation_curve_class = new animation_curve_class();
		
	function color_range_class() 
	{
		precurve.curve = new AnimationCurve().Linear(0,0,1,1);
		precurve.default_curve = new AnimationCurve(precurve.curve.keys);
	}
}

// splat_output_class
class splat_output_class
{
	var active: boolean;
	var foldout: boolean = true;
	var color_splat: Color = Color(2,2,2,1);
	var strength: float = 1;
	var mix: List.<float> = new List.<float>();
	var splat_text: String = "Splat:";
	var splat_terrain: int = 0;
	var splat_terrain_set: boolean = false;
	var terrain_splat_assigned: boolean = false;
	var mix_mode: mix_mode_enum;
	
	var curves: List.<animation_curve_class> = new List.<animation_curve_class>();
	var animation_curve_math: animation_curve_math_class = new animation_curve_math_class();
	var splat: List.<int> = new List.<int>();
	var splat_value: value_class = new value_class();
	var splat_calc: List.<float> = new List.<float>();
	var swap_text: List.<String> = new List.<String>();
	
	function splat_output_class()
	{
		for (var count_splat: int = 0;count_splat < 3;++count_splat)
		{
			add_splat(count_splat);
		}
	}
	
	function add_splat(splat_number: int)
	{
		splat.Insert(splat_number,splat_number);
		splat_calc.Insert(splat_number,0);
		curves.Insert(splat_number,new animation_curve_class());
		mix.Insert(splat_number,0.5);
		splat_value.add_value(splat_number,50);
		swap_text.Insert(splat_number,"S");
		
		set_splat_curve();
		set_splat_text();
	}
	
	function erase_splat(splat_number: int)
	{
		if (splat.Count > 0)
		{
			splat.RemoveAt(splat_number);
			splat_calc.RemoveAt(splat_number);
			mix.RemoveAt(splat_number);
			curves.RemoveAt(splat_number);
			splat_value.erase_value(splat_number);
			swap_text.RemoveAt(splat_number);
		
			set_splat_curve();
			set_splat_text();
		}
	}
	
	function clear_splat()
	{
		splat.Clear();
		splat_value.clear_value();
		mix.Clear();
		curves.Clear();
		swap_text.Clear();
		
		set_splat_curve();
		set_splat_text();
	}
	
	function swap_splat(splat_number1: int,splat_number2: int)
	{
		if (splat_number2 > -1 && splat_number2 < splat.Count)
		{
			var splat2: float = splat[splat_number1];
			var splat_value2: float = splat_value.value[splat_number1];
			
			splat[splat_number1] = splat[splat_number2];
			splat[splat_number2] = splat2;
			
			splat_value.swap_value(splat_number1,splat_number2);
			set_splat_curve();
		}
	}
	
	function set_splat_curve()
	{
		var splat_length: float = curves.Count;
		var splat_off: int = 0;
		var count_splat1: int;
		var frame: Keyframe[];
		
		for (var count_splat: int = 0;count_splat < curves.Count;++count_splat)
		{
			if (!splat_value.active[count_splat]){curves[count_splat].curve = new AnimationCurve.Linear(0,0,0,0);--splat_length;}
		}
		
		if (splat_length == 1){curves[0].curve = new AnimationCurve.Linear(0,1,1,1);return;}
		
		var step: float;
		step = 1/(splat_length);
		var mix1: float;
		var mix2: float;
		
		for (count_splat = 0;count_splat < curves.Count;++count_splat)
		{
			if (!splat_value.active[count_splat]){++splat_off;continue;}
			
			count_splat1 = count_splat - splat_off;
			curves[count_splat].curve = new AnimationCurve();
			if (mix_mode == mix_mode_enum.Single)
			{
				if (count_splat1 == 0)
				{
					mix1 = (1-mix[1])*(step/2);
				}
				if (count_splat1 > 0 && count_splat1 < splat_length-1)
				{
					mix1 = (1-mix[count_splat])*(step/2);
					mix2 = (1-mix[count_splat+1])*(step/2);
				}
				
				if (count_splat1 == splat_length-1)
				{
					mix2 = (1-mix[count_splat])*(step/2);
				}
			} 
			else 
			{
				mix1 = (1-mix[0])*(step/2);
				mix2 = (1-mix[0])*(step/2);
			}
							
			if (splat_length > 1)
			{
				
				if (count_splat1 == 0)
				{
					frame = new Keyframe[3];
					frame[0] = Keyframe(0,1);
					frame[1] = Keyframe(mix1+(step/2),1);
					frame[2] = Keyframe(((step*(count_splat1+1))-mix1)+0.0000001+(step/2),0);
				}
				if (count_splat1 > 0 && count_splat1 < splat_length-1)
				{
					frame = new Keyframe[4];
					frame[0] = Keyframe(((step*(count_splat1-1))+mix1)-0.0000001+(step/2),0);
					frame[1] = Keyframe((step*count_splat1)-mix1+(step/2),1);
					if (!Mathf.Approximately((step*count_splat1)-mix1+(step/2),(step*count_splat1)+mix2+(step/2)))
					{
						frame[2] = Keyframe((step*count_splat1)+mix2+(step/2),1);
					}
					frame[3] = Keyframe(((step*(count_splat1+1))-mix2)+0.0000001+(step/2),0);
				} 
				if (count_splat1 == splat_length-1)
				{
					frame = new Keyframe[3];
					frame[0] = Keyframe(((step*(count_splat1-1))+mix2)-0.0000001+(step/2),0);
					frame[1] = Keyframe(1-mix2-(step/2),1);
					frame[2] = Keyframe(1,1);
				}
				curves[count_splat].curve = animation_curve_math.set_curve_linear(AnimationCurve(frame));
			}
		}
	}
	
	function set_splat_text()
	{
		if (splat.Count > 1){splat_text = "Splats("+splat.Count+")";} else {splat_text = "Splat";}
	}
}

// tree_output_class
class tree_output_class
{
	var active: boolean;
	var color_tree: Color = Color(2,2,2,1);
	var foldout: boolean = true;
	var strength: float = 1;
	var interface_display: boolean = true;
	var icon_display: boolean = true;
	var trees_active: boolean = true;
	var trees_foldout: boolean = true;
	var tree_terrain: int = 0;
	var tree_terrain_set: boolean = false;
	var terrain_tree_assigned: boolean = false;
	var tree_text: String = "Tree:";
	var scale: float = 1;
	var tree: List.<tree_class> = new List.<tree_class>();
	var tree_value: value_class = new value_class();
	var placed: int = 0;
	var placed_reference: tree_output_class;
	
	function set_scale(tree1: tree_class,tree_number: int,all: boolean)
	{
		for (var count_tree: int = 0;count_tree < tree.Count;++count_tree)
		{
			if (tree_value.active[count_tree] || all)
			{
				if (count_tree != tree_number)
				{
					tree[count_tree].link_start = tree1.link_start;
					tree[count_tree].link_end = tree1.link_end;
					tree[count_tree].width_start = tree1.width_start;
					tree[count_tree].width_end = tree1.width_end;
					tree[count_tree].height_start = tree1.height_start;
					tree[count_tree].height_end = tree1.height_end;
					tree[count_tree].unlink = tree1.unlink;	
					tree[count_tree].random_position = tree1.random_position;	
				}
				
				if (tree[count_tree].color_tree[0] < 1.5){tree[count_tree].color_tree += Color(0.5,0.5,0.5,0);}
			}		
		}
	}
	
	function set_distance(tree1: tree_class,tree_number: int,all: boolean)
	{
		for (var count_tree: int = 0;count_tree < tree.Count;++count_tree)
		{
			if (tree_value.active[count_tree] || all)
			{
				if (count_tree != tree_number)
				{
					tree[count_tree].min_distance = tree1.min_distance;
					tree[count_tree].distance_level = tree1.distance_level;
					tree[count_tree].distance_mode = tree1.distance_mode;
					tree[count_tree].distance_rotation_mode = tree1.distance_rotation_mode;
					tree[count_tree].distance_include_scale = tree1.distance_include_scale;
					tree[count_tree].distance_include_scale_group = tree1.distance_include_scale_group;
				}
				
				if (tree[count_tree].color_tree[0] < 1.5){tree[count_tree].color_tree += Color(0.5,0.5,0.5,0);}
			}		
		}
	}

	function add_tree(tree_number: int,script: terraincomposer_save,new_filter: boolean)
	{
		tree.Insert(tree_number,new tree_class(script,new_filter));
		tree_value.add_value(tree_number,50);	
		set_tree_text();
	}
	
	function erase_tree(tree_number: int,script: terraincomposer_save)
	{
		if (tree.Count > 0)
		{
			script.erase_filters(tree[tree_number].prefilter);
			tree.RemoveAt(tree_number);
			tree_value.erase_value(tree_number);
			set_tree_text();
		}
	}
	
	function clear_tree(script: terraincomposer_save)
	{
		var length: int = tree.Count;
		
		for (var count_tree: int = 0;count_tree < length;++count_tree)
		{
			erase_tree(tree.Count-1,script);
		}
	}
	
	function swap_tree(tree_number: int,tree_number2: int)
	{
		if (tree_number2 > -1 && tree_number2 < tree.Count)
		{
			var tree2: tree_class = tree[tree_number];
			var tree_value2: float = tree_value.value[tree_number];
			
			tree[tree_number] = tree[tree_number2];		
			tree[tree_number2] = tree2;
			if (tree[tree_number].color_tree[0] < 1.5){tree[tree_number].color_tree += Color(0.5,0.5,0.5,0);}
			if (tree[tree_number2].color_tree[0] < 1.5){tree[tree_number2].color_tree += Color(0.5,0.5,0.5,0);}
			tree_value.swap_value(tree_number,tree_number2);
		}
	}
	
	function set_tree_text()
	{
		if (tree.Count > 1){tree_text = "Trees("+tree.Count+")";} else {tree_text = "Tree("+tree.Count+")";}
	}
}

// tree_class
class tree_class
{
	var foldout: boolean = false;
	var interface_display: boolean = true;
	var prototypeindex: int = 0;
	var placed: int = 0;
	var placed_reference: tree_class;
	var swap_text: String = "S";
	var swap_select: boolean = false;
	var copy_select: boolean = false;
	var color_tree: Color = Color(1,1,1,1);
	
	var precolor_range: precolor_range_class = new precolor_range_class(1,false);
	var scale_foldout: boolean = false;
	var link_start: boolean = true;
	var link_end: boolean = true;
	var width_start: float = 1;
	var width_end: float = 2.5;
	var height_start: float = 1;
	var height_end: float = 2.5;
	var unlink: float = 0.25;
	var random_position: boolean = true;
	
	var distance_foldout: boolean = false;
	var min_distance: Vector3;
	var distance_level: distance_level_enum;
	var distance_mode: distance_mode_enum;
	var distance_rotation_mode: rotation_mode_enum;
	var distance_include_scale: boolean = true;
	var distance_include_scale_group: boolean = true;
	
	var data_foldout: boolean = false;
	var mesh_length: int;
	var mesh_triangles: int;
	var mesh_combine: int;
	var mesh_size: Vector3;
	
	var objects_placed: List.<distance_class> = new List.<distance_class>();
	
	var prefilter: prefilter_class = new prefilter_class();
	
	function tree_class(script: terraincomposer_save,new_filter: boolean)
	{
		if (new_filter)
		{
			script.add_filter(0,prefilter);
			script.filter[script.filter.Count-1].type = condition_type_enum.Random;
			script.add_subfilter(0,script.filter[script.filter.Count-1].presubfilter);
			script.subfilter[script.subfilter.Count-1].type = condition_type_enum.Random;
			script.subfilter[script.subfilter.Count-1].from_tree = true;
		}
		precolor_range.color_range[0].color_start = Color(0.75,0.75,0.75);
		precolor_range.color_range[0].color_end = Color(1,1,1);
	}
	
	function count_mesh(object1: GameObject)
	{
		if (object1)
		{
			var meshfilter: MeshFilter = object1.GetComponent(MeshFilter);
			var mesh: Mesh;
			var vertices: Vector3[];
			var triangles: int[];
			if (meshfilter){mesh = meshfilter.sharedMesh;} else {Debug.Log("meshfilter not found, cannot display data");return;}
		
			if (mesh)
			{
				vertices = mesh.vertices;
				mesh_size = mesh.bounds.size;
				triangles = mesh.triangles;
			} else {Debug.Log("mesh not found, cannot display data");return;}
			if (vertices)
			{
				mesh_length = vertices.Length;
				mesh_combine = Mathf.Round(64000/mesh_length);
				mesh_triangles = triangles.Length;
			} else {Debug.Log("vertices not found, cannot display data");}
		}
		else
		{
			mesh_combine = 0;
			mesh_size = Vector3(0,0,0);
			mesh_length = 0;
			mesh_triangles = 0;
		}
	}
}	

// grass_output_class
class grass_output_class
{
	var active: boolean = true;;
	var foldout: boolean = true;
	var color_grass: Color = Color(2,2,2,1);
	var strength: float = 1;
	var grass_terrain: int = 0;
	var grass_terrain_set: boolean = false;
	var grass_text: String = "Grass:";
	var mix: List.<float> = new List.<float>();
	var mix_mode: mix_mode_enum;
	var animation_curve_math: animation_curve_math_class = new animation_curve_math_class();
	
	var curves: List.<animation_curve_class> = new List.<animation_curve_class>();
	
	var grass: List.<grass_class> = new List.<grass_class>();
	var grass_value: value_class = new value_class();
	var grass_calc: List.<float> = new List.<float>();
			
	function grass_output_class()
	{
		add_grass(0);
	}
	
	function add_grass(grass_number: int)
	{
		grass.Insert(grass_number,new grass_class());
		grass_calc.Insert(grass_number,0);
		curves.Insert(grass_number,new animation_curve_class());
		mix.Insert(grass_number,0.5);
		grass_value.add_value(grass_number,50);
		
		set_grass_curve();
		set_grass_text();
	}
	
	function erase_grass(grass_number: int)
	{
		if (grass.Count > 0)
		{
			grass.RemoveAt(grass_number);
			grass_calc.RemoveAt(grass_number);
			grass_value.erase_value(grass_number);
			mix.RemoveAt(grass_number);
			curves.RemoveAt(grass_number);
			
			set_grass_curve();
			set_grass_text();
		}
	}
	
	function clear_grass()
	{
		grass.Clear();
		grass_calc.Clear();
		grass_value.clear_value();
		mix.Clear();
		curves.Clear();
		
		set_grass_curve();
		set_grass_text();
	}
	
	function swap_grass(grass_number: int,grass_number2: int): boolean
	{
		if (grass_number2 > -1 && grass_number2 < grass.Count)
		{
			var grass2: grass_class = grass[grass_number];
			var grass_value2: float = grass_value.value[grass_number];
			var grass_active2: boolean = grass_value.active[grass_number];
			
			grass[grass_number] = grass[grass_number2];		
			grass[grass_number2] = grass2;
			
			grass_value.value[grass_number] = grass_value.value[grass_number2];
			grass_value.value[grass_number2] = grass_value2;
			
			grass_value.active[grass_number] = grass_value.active[grass_number2];
			grass_value.active[grass_number2] = grass_active2;
			
			set_grass_curve();
			return true;
		}
		return false;
	}
	
	function set_grass_curve()
	{
		var grass_length: float = curves.Count;
		var grass_off: int = 0;
		var count_grass1: int;
		var frame: Keyframe[];
		
		for (var count_grass: int = 0;count_grass < curves.Count;++count_grass)
		{
			if (!grass_value.active[count_grass]){curves[count_grass].curve = new AnimationCurve.Linear(0,0,0,0);--grass_length;}
		}
		
		if (grass_length == 1){curves[0].curve = new AnimationCurve.Linear(0,1,1,1);return;}
		
		var step: float;
		step = 1/(grass_length);
		var mix1: float;
		var mix2: float;
		
		for (count_grass = 0;count_grass < curves.Count;++count_grass)
		{
			if (!grass_value.active[count_grass]){++grass_off;continue;}
			
			count_grass1 = count_grass - grass_off;
			curves[count_grass].curve = new AnimationCurve();
			if (mix_mode == mix_mode_enum.Single)
			{
				if (count_grass1 == 0)
				{
					mix1 = (1-mix[1])*(step/2);
				}
				if (count_grass1 > 0 && count_grass1 < grass_length-1)
				{
					mix1 = (1-mix[count_grass])*(step/2);
					mix2 = (1-mix[count_grass+1])*(step/2);
				}
				
				if (count_grass1 == grass_length-1)
				{
					mix2 = (1-mix[count_grass])*(step/2);
				}
			} 
			else 
			{
				mix1 = (1-mix[0])*(step/2);
				mix2 = (1-mix[0])*(step/2);
			}
							
			if (grass_length > 1)
			{
				
				if (count_grass1 == 0)
				{
					frame = new Keyframe[3];
					frame[0] = Keyframe(0,1);
					frame[1] = Keyframe(mix1+(step/2),1);
					frame[2] = Keyframe(((step*(count_grass1+1))-mix1)+0.0000001+(step/2),0);
				}
				if (count_grass1 > 0 && count_grass1 < grass_length-1)
				{
					frame = new Keyframe[4];
					frame[0] = Keyframe(((step*(count_grass1-1))+mix1)-0.0000001+(step/2),0);
					frame[1] = Keyframe((step*count_grass1)-mix1+(step/2),1);
					if (!Mathf.Approximately((step*count_grass1)-mix1+(step/2),(step*count_grass1)+mix2+(step/2))){frame[2] = Keyframe((step*count_grass1)+mix2+(step/2),1);}
					frame[3] = Keyframe(((step*(count_grass1+1))-mix2)+0.0000001+(step/2),0);
				} 
				if (count_grass1 == grass_length-1)
				{
					frame = new Keyframe[3];
					frame[0] = Keyframe(((step*(count_grass1-1))+mix2)-0.0000001+(step/2),0);
					frame[1] = Keyframe(1-mix2-(step/2),1);
					frame[2] = Keyframe(1,1);
				}
				curves[count_grass].curve = animation_curve_math.set_curve_linear(AnimationCurve(frame));
			}
		}
	}
	
	function set_grass_text()
	{
		if (grass.Count > 1){grass_text = "Grass("+grass.Count+")";} else {grass_text = "Grass";}
	}
}

// grass_class	
class grass_class
{
	var foldout: boolean = false;
	var active: boolean = true;
	var prototypeindex: int;
	var value: float;
}

// detail_class
class detail_class
{
	var detail: int[,];
}

// precolor_range_class	
class precolor_range_class 
{
	var foldout: boolean = true;
	var color_ranges_active: boolean = true;
	var color_ranges_foldout: boolean = true;
	var palette: boolean = false;
	// RGB output curves
	var curve_red: AnimationCurve = new AnimationCurve();
	var curve_green: AnimationCurve = new AnimationCurve();
	var curve_blue: AnimationCurve = new AnimationCurve();
	var animation_curve_math: animation_curve_math_class = new animation_curve_math_class();
	
	var interface_display: boolean = true;
	var index: int;
	var one_color: boolean = false;
	var menu_rect: Rect;
	var text: String = "Color Range:";
	var rect: Rect;
	var detect_max: int = 8;
	
	var color_range: List.<color_range_class> = new List.<color_range_class>();
	var color_range_value: value_class = new value_class();
	
	function precolor_range_class(length: int,one_color1: boolean)
	{
		for (var count: int = 0;count < length;++count)
		{
			add_color_range(count,one_color1);
		}
		one_color = one_color1;
		set_color_range_text();
		set_precolor_range_curve();
	}
	
	function add_color_range(color_range_number: int,one_color: boolean)
	{
		color_range.Insert(color_range_number,new color_range_class());
		color_range[color_range_number].one_color = one_color;
		color_range[color_range_number].select_output = color_range_number;
		color_range_value.add_value(color_range_number,50);
		
		set_precolor_range_curve();
		set_color_range_text();
	}	

	function erase_color_range(color_range_number: int)
	{
		if (color_range.Count > 0)
		{
			color_range.RemoveAt(color_range_number);
			color_range_value.erase_value(color_range_number);
			set_precolor_range_curve();
			set_color_range_text();
		}
	}
	
	function clear_color_range()
	{
		color_range.Clear();
		color_range_value.clear_value();
		set_precolor_range_curve();
		set_color_range_text();
	}
	
	function invert_color_range(color_range_number: int)
	{
		var step: float = 1.0/255.0;
		
		color_range_value.active[color_range_number] = false;
		add_color_range(color_range_number+1,false);
		add_color_range(color_range_number+1,false);
		
		if (color_range[color_range_number].color_start != Color(0,0,0))
		{
			if (color_range_number < 2){color_range[color_range_number+1].color_start = Color(0,0,0);} else {color_range[color_range_number+1].color_start = color_range[color_range_number-1].color_end+Color(step,step,step);}
			color_range[color_range_number+1].color_end = color_range[color_range_number].color_start+Color(-step,-step,-step);
		}
		if (color_range[color_range_number].color_end != Color(1,1,1))
		{
			color_range[color_range_number+2].color_start = color_range[color_range_number].color_end+Color(step,step,step);
			if (color_range.Count-1 == color_range_number+2){color_range[color_range_number+2].color_end = Color(1,1,1);} else {color_range[color_range_number+2].color_end = color_range[color_range_number+3].color_start+Color(-step,-step,-step);}
		}
	}
		
	function set_color_range_text()
	{
		text = "Color Range"+index+" ("+color_range.Count+")";
	}
	
	function swap_color(color_range_number1: int,color_range_number2: int)
	{
		var color_range2: color_range_class;
		var color_range_value2: float;
		
		if (color_range_number2 > -1 && color_range_number2 < color_range.Count)
		{
			color_range2 = color_range[color_range_number1];
			color_range[color_range_number1] = color_range[color_range_number2];
			color_range[color_range_number2] = color_range2;
			if (color_range[color_range_number1].color_color_range[0] < 1.5){color_range[color_range_number1].color_color_range += Color(1,1,1,1);}
			if (color_range[color_range_number2].color_color_range[0] < 1.5){color_range[color_range_number2].color_color_range += Color(1,1,1,1);}
			color_range_value.swap_value(color_range_number1,color_range_number2);
			set_precolor_range_curve();
		}
	}
	
	function detect_colors_image(texture: Texture2D)
	{
		var detect: int = 0;
		var color: Color;
		var count_color_range: int;
		var in_list: boolean = false;
		
		for (var y: int = 0;y < texture.height;++y)
		{
			for (var x: int = 0;x < texture.width;++x)
			{
				color = texture.GetPixel(x,y);
				in_list = false;
				for (count_color_range = 0;count_color_range < color_range.Count;++count_color_range)
				{
					if (color == color_range[count_color_range].color_start){in_list = true;} 
				}
				if (!in_list)
				{
					add_color_range(color_range.Count,true);
					color_range[color_range.Count-1].color_start = color;
					++detect;
					if (detect > detect_max-1){return;}
				}
			}		
		}
	}
	
	function set_precolor_range_curve()
	{
		curve_red = new AnimationCurve();
		curve_green = new AnimationCurve();
		curve_blue = new AnimationCurve();				
						
		var color_length: float = color_range.Count;
		if (color_length > 1)
		{
			var step: float = 1/(color_length-1);
			for (var counter: int = 0;counter < color_length;++counter)
			{	
				var number1: int;
				number1 = curve_red.AddKey(counter*step,color_range[counter].color_start.r);			
				number1 = curve_green.AddKey(counter*step,color_range[counter].color_start.g);
				number1 = curve_blue.AddKey(counter*step,color_range[counter].color_start.b);
			}
		}
		else if (color_length == 1)
		{
			curve_red.AddKey(0,color_range[0].color_start.r);
			curve_red.AddKey(1,color_range[0].color_start.r);
			curve_green.AddKey(0,color_range[0].color_start.g);
			curve_green.AddKey(1,color_range[0].color_start.g);
			curve_blue.AddKey(0,color_range[0].color_start.b);
			curve_blue.AddKey(1,color_range[0].color_start.b);
		}
		curve_red = animation_curve_math.set_curve_linear(curve_red);
		curve_green = animation_curve_math.set_curve_linear(curve_green);
		curve_blue = animation_curve_math.set_curve_linear(curve_blue);
	}
}
	
//splat_range_class
class splat_range_class
{
	var index: int;
	var range_start: Color;
	var range_end: Color;
}

// line_placement
class line_placement_class
{
	var foldout: boolean = false;
	var preimage: image_class = new image_class();
	var line_list: List.<line_list_class> = new List.<line_list_class>();
	var line_list_foldout: boolean = false;
}

class line_list_class
{
	var color: Color = Color(1,0,0);
	var foldout: boolean = false;
	var point_foldout: boolean = false;
	var point_length: int;
	var points: List.<Vector3> = new List.<Vector3>();
}
	
// object_output_class
class object_output_class
{
	var active;
	var foldout: boolean = true;
	var color_object: Color = Color(2,2,2,1);
	var line_placement: line_placement_class;
	var object_mode: object_mode_enum;
	var icon_display: boolean = true;
	var objects_active: boolean = true;
	var objects_foldout: boolean = true;
	var strength: float = 1;
	var interface_display: boolean = true;
	var object_set: boolean = false;
	var object_text: String = "Object:";
	var scale: float = 1;
	var min_distance_x: float;
	var min_distance_z: float;
	var min_distance_x_rot: float;
	var min_distance_z_rot: float;
	var group_rotation: boolean = false;
	var group_rotation_steps: boolean = false;
	var group_rotation_step: Vector3;
	
	var objects_placed = new List.<Vector3>();
	var placed: int = 0;
	var placed_reference: object_output_class;
	var objects_placed_rot = new List.<Vector3>();
	var object: List.<object_class> = new List.<object_class>();
	var object_value: value_class = new value_class();
	var rotation_map: rotation_map_class = new rotation_map_class();
	
	var search_active: boolean = false;
	var search_erase_doubles: boolean = false;
	var search_object: Transform;
	
	function set_settings(object1: object_class,object_number: int,all: boolean)
	{
		for (var count_object: int = 0;count_object < object.Count;++count_object)
		{
			if (object_value.active[count_object] || all)
			{
				if (count_object != object_number)
				{
					object[count_object].parent = object1.parent;
					object[count_object].parent_clear = object1.parent_clear;
					object[count_object].combine = object1.combine;
					object[count_object].combine_total = object1.combine_total;
					object[count_object].place_max = object1.place_max;
					object[count_object].place_maximum = object1.place_maximum;
					object[count_object].place_maximum_total = object1.place_maximum_total;
				}
				
				if (object[count_object].color_object[0] > 0.5){object[count_object].color_object += Color(-0.5,0,-0.5,0);}
			}		
		}
	}
	
	function set_transform(object1: object_class,object_number: int,all: boolean)
	{
		for (var count_object: int = 0;count_object < object.Count;++count_object)
		{
			if (object_value.active[count_object] || all)
			{
				if (count_object != object_number)
				{
					object[count_object].scale_start = object1.scale_start;
					object[count_object].scale_end = object1.scale_end;
					object[count_object].scale_link = object1.scale_link;
					object[count_object].scale_link_start_y = object1.scale_link_start_y;
					object[count_object].scale_link_end_y = object1.scale_link_end_y;
					object[count_object].scale_link_start_z = object1.scale_link_start_z;
					object[count_object].scale_link_end_z = object1.scale_link_end_z;
					object[count_object].rotation_start = object1.rotation_start;
					object[count_object].rotation_end = object1.rotation_end;
					object[count_object].rotation_link = object1.rotation_link;
					object[count_object].rotation_link_start_y = object1.rotation_link_start_y;
					object[count_object].rotation_link_end_y = object1.rotation_link_end_y;
					object[count_object].rotation_link_start_z = object1.rotation_link_start_z;
					object[count_object].rotation_link_end_z = object1.rotation_link_end_z;
					object[count_object].terrain_height = object1.terrain_height;
					object[count_object].position_start = object1.position_start;
					object[count_object].position_end = object1.position_end;
					object[count_object].unlink_y = object1.unlink_y;
					object[count_object].unlink_z = object1.unlink_z;
					object[count_object].random_position = object1.random_position;
				}
				
				if (object[count_object].color_object[0] > 0.5){object[count_object].color_object += Color(-0.5,0,-0.5,0);}
			}		
		}
	}
	
	function set_rotation(object1: object_class,object_number: int,all: boolean)
	{
		for (var count_object: int = 0;count_object < object.Count;++count_object)
		{
			if (object_value.active[count_object] || all)
			{
				if (count_object != object_number)
				{
					object[count_object].rotation_steps = object1.rotation_steps;
					object[count_object].rotation_step = object1.rotation_step;
					object[count_object].rotation_map = copy_rotation_map(object1.rotation_map);
				}
				
				if (object[count_object].color_object[0] > 0.5){object[count_object].color_object += Color(-0.5,0,-0.5,0);}
			}		
		}
	}
	
	function set_distance(object1: object_class,object_number: int,all: boolean)
	{
		for (var count_object: int = 0;count_object < object.Count;++count_object)
		{
			if (object_value.active[count_object] || all)
			{
				if (count_object != object_number)
				{
					object[count_object].min_distance = object1.min_distance;
					object[count_object].distance_level = object1.distance_level;
					object[count_object].distance_mode = object1.distance_mode;
					object[count_object].distance_rotation_mode = object1.distance_rotation_mode;
					object[count_object].distance_include_scale = object1.distance_include_scale;
					object[count_object].distance_include_scale_group = object1.distance_include_scale_group;
				}
				
				if (object[count_object].color_object[0] > 0.5){object[count_object].color_object += Color(-0.5,0,-0.5,0);}
			}		
		}
	}
	
	function swap_object(object_number: int,object_number2: int)
	{
		if (object_number2 > -1 && object_number2 < object.Count)
		{
			var object2: object_class = object[object_number];
			var object_value2: float = object_value.value[object_number];
			var object_active2: boolean = object_value.active[object_number];
			
			object[object_number] = object[object_number2];		
			object[object_number2] = object2;
			if (object[object_number].color_object[0] > 0.5){object[object_number].color_object += Color(-0.5,0,-0.5,0);}
			if (object[object_number2].color_object[0] > 0.5){object[object_number2].color_object += Color(-0.5,0,-0.5,0);}
			object_value.value[object_number] = object_value.value[object_number2];
			object_value.value[object_number2] = object_value2;
			object_value.active[object_number] = object_value.active[object_number2];
			object_value.active[object_number2] = object_active2;
			object_value.calc_value();
		}
	}

	function set_object_text()
	{
		if (object.Count > 1){object_text = "Objects("+object.Count+")";} else {object_text = "Object";}
	}
	
	function copy_rotation_map(rotation_map: rotation_map_class): rotation_map_class
	{
		var rotation_map2: rotation_map_class;
		
		var object: GameObject = new GameObject();
		var script3: save_template = object.AddComponent(save_template);
		
		script3.rotation_map = rotation_map;
		
		var object2: GameObject = GameObject.Instantiate(object);
		GameObject.DestroyImmediate(object);
		script3 = object2.GetComponent(save_template);
		rotation_map2 = script3.rotation_map;
		GameObject.DestroyImmediate(object2);
		
		return rotation_map2;
	}
}

// object_class
class object_class
{
	var foldout: boolean = false;
	var data_foldout: boolean = false;
	var transform_foldout: boolean = false;
	var settings_foldout: boolean = false;
	var distance_foldout: boolean = false;
	var rotation_foldout: boolean = false;
	var rotation_map_foldout: boolean = false;
	var random_position: boolean = true;
	var object1: GameObject;
	var object2: GameObject;
	var name: String;
	var color_object: Color = Color(2,2,2,1);
	
	// settings
	var parent: Transform;
	var parent_clear: boolean = true;
	var parent_name: String;
	var combine: boolean = true;
	var combine_total: boolean = true;
	var place_max: int = 1;
	var place_maximum: boolean = false;
	var place_maximum_total: boolean = false;
	
	var parent_set: boolean = false;
	
	// transform
	var scale_start: Vector3 = Vector3(1,1,1);
	var scale_end: Vector3 = Vector3(1,1,1);
	var unlink_y: float = 0.25;
	var unlink_z: float = 0.25;
	var unlink_foldout: boolean = false;
	var scale_link: boolean = true;
	var scale_link_start_y: boolean = true;
	var scale_link_end_y: boolean = true;
	var scale_link_start_z: boolean = true;
	var scale_link_end_z: boolean = true;
	var rotation_start: Vector3 = Vector3(0,0,0);
	var rotation_end: Vector3 = Vector3(0,0,0);
	var rotation_link: boolean = false;
	var rotation_link_start_y: boolean = false;
	var rotation_link_end_y: boolean = false;
	var rotation_link_start_z: boolean = false;
	var rotation_link_end_z: boolean = false;
	var position_start: Vector3 = Vector3(0,0,0);
	var position_end: Vector3 = Vector3(0,0,0);
	var terrain_height: boolean = true;
	var terrain_rotate: boolean = false;
	
	var scale_steps: boolean = false;
	var scale_step: Vector3;
	var position_steps: boolean;
	var position_step: Vector3;
	var parent_rotation: Vector3;
	var look_at_parent: boolean = false;
	
	// rotation
	var rotation_steps: boolean = false;
	var rotation_step: Vector3;
	var rotation_map: rotation_map_class = new rotation_map_class();
	
	// distance
	var min_distance: Vector3;
	var distance_level: distance_level_enum;
	var distance_mode: distance_mode_enum;
	var distance_rotation_mode: rotation_mode_enum;
	var distance_include_scale: boolean = true;
	var distance_include_scale_group: boolean = true;
	
	var objects_placed: List.<distance_class> = new List.<distance_class>();
	
	var placed: int = 0;
	var placed_reference: object_class;
	
	var placed_prelayer: int = 0;
	
	var mesh_length: int;
	var mesh_triangles: int;
	var mesh_combine: int;
	var mesh_size: Vector3;
	var object_material: material_class = new material_class();
	var combine_parent: GameObject;
	var combine_parent_name: String = "";
	var combine_parent_name_input: boolean = false;
	
	var value: float;
	
	var prelayer_index: int;
	var prelayer_created: boolean = false;
	var swap_text: String = "S";
	var swap_select: boolean = false;
	var copy_select: boolean = false;
	var object_child: List.<object_class> = new List.<object_class>();
	
	var preview_texture: Texture2D;
	
	function count_mesh()
	{
		if (object1)
		{
			var meshfilter: MeshFilter = object1.GetComponent(MeshFilter);
			var mesh: Mesh;
			var vertices: Vector3[];
			var triangles: int[];
			if (meshfilter){mesh = meshfilter.sharedMesh;} else {}
		
			if (mesh)
			{
				vertices = mesh.vertices;
				mesh_size = mesh.bounds.size;
				triangles = mesh.triangles;
			} else {}
			if (vertices)
			{
				mesh_length = vertices.Length;
				mesh_combine = Mathf.Round(64000/mesh_length);
				mesh_triangles = triangles.Length;
			} else {}
		}
		else
		{
			mesh_combine = 0;
			mesh_size = Vector3(0,0,0);
			mesh_length = 0;
			mesh_triangles = 0;
		}
	}
}

class distance_class
{
	var position: Vector3;
	var rotation: Vector3;
	var min_distance: Vector3;
	var min_distance_rotation_group: Vector3;
	
	var distance_mode: distance_mode_enum;
	var distance_rotation: rotation_mode_enum;
	
	var rotation_group: boolean = false;
}

class rotation_map_class
{
	var active: boolean = false;
	var preimage: image_class = new image_class();
	
	function calc_rotation(color: Color): float
	{
		if (color == Color(1,1,1)){return 0;}
		return ((-color.r*255)+(-color.g*255)+(-color.b));
	}
}

// animation_curve_class
class animation_curve_class
{
	var curve_in_memory: boolean = false;
	var curve_text: String = "Curve";
	var menu_rect: Rect;
	var curve: AnimationCurve = new AnimationCurve();
	var default_curve: AnimationCurve = new AnimationCurve();
	var abs: boolean = false;
	var type: curve_type_enum;
	var active: boolean = true;
	
	var settings_foldout: boolean = true;
	var frequency: float = 256;
	var offset: Vector2;
	var offset_range: Vector2 = Vector2(5,5);
	var offset_middle: Vector2;
	var detail: int = 1;
	var detail_strength: float = 2;
	var pivot: Transform;
	
	function set_zero()
	{
		curve = new AnimationCurve().Linear(0,0,1,0);
	}
	
	function set_invert()
	{
		var curve3: AnimationCurve = new AnimationCurve();
		for (var counter: int = 0;counter < curve.keys.Length;++counter)
		{
			var key: Keyframe = curve.keys[counter];
			key.value = 1 - key.value;
			var intangent: float = key.inTangent;
			key.inTangent = key.inTangent*-1;
			key.outTangent = key.outTangent*-1;
			curve3.AddKey(key);
		}
		curve = new AnimationCurve(curve3.keys);
	}
	
	function set_default()
	{
		curve = new AnimationCurve(default_curve.keys);
	}
	
	function set_as_default()
	{
		default_curve = new AnimationCurve(curve.keys);
	}
	
	function change_key(time: float,value: float)
	{
		if (curve.AddKey(time,value) == -1)
		{
			var keys: Keyframe[] = curve.keys;
			for (var count: int = 0;count < curve.keys.Length;++count)
			{
				if (keys[count].time == time){keys[count].value = value;}
			}
			curve = new AnimationCurve(keys);
		}
	}
}

class animation_curve_math_class
{
	function set_curve_linear(curve: AnimationCurve): AnimationCurve
	{
		var curve3: AnimationCurve = new AnimationCurve();
		for (var count_key: int = 0;count_key < curve.keys.Length;++count_key)
		{
			var intangent: float = 0;
			var outtangent: float = 0;
			var intangent_set: boolean = false;
			var outtangent_set: boolean = false;
			var point1: Vector2;
			var point2: Vector2;
			var deltapoint: Vector2;
			var key: Keyframe = curve[count_key];
			
			if (count_key == 0){intangent = 0;intangent_set = true;}
			if (count_key == curve.keys.Length -1){outtangent = 0;outtangent_set = true;}
			
			if (!intangent_set)
			{
				point1.x = curve.keys[count_key-1].time;
				point1.y = curve.keys[count_key-1].value;
				point2.x = curve.keys[count_key].time;
				point2.y = curve.keys[count_key].value;
					
				deltapoint = point2-point1;
				
				intangent = deltapoint.y/deltapoint.x;
			}
			if (!outtangent_set)
			{
				point1.x = curve.keys[count_key].time;
				point1.y = curve.keys[count_key].value;
				point2.x = curve.keys[count_key+1].time;
				point2.y = curve.keys[count_key+1].value;
					
				deltapoint = point2-point1;
						
				outtangent = deltapoint.y/deltapoint.x;
			}
					
			key.inTangent = intangent;
			key.outTangent = outtangent;
			curve3.AddKey(key);
		}
		return curve3;
	}

}

class value_class
{
	var value: List.<float> = new List.<float>();
	var select_value: List.<float> = new List.<float>();
	var active: List.<boolean> = new List.<boolean>();
	var text: List.<String> = new List.<String>();
	var value_total: float;
	var active_total: int;
	var curve: AnimationCurve = new AnimationCurve();
	var animation_curve_math: animation_curve_math_class = new animation_curve_math_class();
	
	function calc_value()
	{
		if (select_value.Count < value.Count)
		{
			var difference: int = value.Count-select_value.Count;
			
			for (var count_select_value: int = 0;count_select_value < difference;++count_select_value)
			{
				select_value.Add(0);
			}
		}
		
		value_total = 0;
		active_total = 0;
		var value2: float = 0;
		
		for (var count_value: int = 0;count_value < value.Count;++count_value)
		{
			if (active[count_value]){value_total += value[count_value];++active_total;}
		}
		var keys: Keyframe[] = new Keyframe[active_total+1];
		var count_active: int = 0;
		for (count_value = 0;count_value < value.Count;++count_value)
		{
			if (active[count_value])
			{
				keys[count_active].value = ((1.0/(active_total*1.0))*(count_active+1));
				keys[count_active].time = value2+(value[count_value]/value_total);
				select_value[count_value] = ((value2*2)+(value[count_value]/value_total))/2;
				text[count_value] = "(V "+value2.ToString("F2")+"-"+keys[count_active].time.ToString("F2")+")";
				value2 = keys[count_active].time;
				++count_active;
			} else {text[count_value] = "(V - )";}
		}
		
		curve = animation_curve_math.set_curve_linear(new AnimationCurve(keys));
	}
	
	function add_value(value_index: int,number: float)
	{
		if (select_value.Count < value.Count)
		{
			var difference: int = value.Count-select_value.Count;
			
			for (var count_select_value: int = 0;count_select_value < difference;++count_select_value)
			{
				select_value.Add(0);
			}
		}
		value.Insert(value_index,number);
		select_value.Insert(value_index,0);
		text.Insert(value_index,String.Empty);
		active.Insert(value_index,true);
		calc_value();
	}
	
	function erase_value(value_index: int)
	{
		value.RemoveAt(value_index);
		if (value_index < select_value.Count){select_value.RemoveAt(value_index);}
		text.RemoveAt(value_index);
		active.RemoveAt(value_index);
		calc_value();
	}
	
	function clear_value()
	{
		value.Clear();
		select_value.Clear();
		text.Clear();
		active.Clear();
	}
	
	function swap_value(value_number1: int,value_number2: int) 
	{
		var value2: float = value[value_number1];
		var active2: boolean = active[value_number1];
		var select2: float = select_value[value_number1];
		
		value[value_number1] = value[value_number2];
		value[value_number2] = value2;
		
		active[value_number1] = active[value_number2];
		active[value_number2] = active2;
		
		select_value[value_number1] = select_value[value_number2];
		select_value[value_number2] = select2;
		
		calc_value();
	}
}

class material_class
{
	var active: boolean = false;
	var foldout: boolean = false;
	var material: List.<Material> = new List.<Material>();
	var combine_count: List.<int> = new List.<int>();
	var combine_parent: List.<GameObject> = new List.<GameObject>();
	
	var material_value: value_class = new value_class();
	
	function material_class()
	{
		add_material(0);
	}
	
	function set_material(object: GameObject,material_number: int): int
	{
		var meshrenderer: MeshRenderer = object.GetComponent(MeshRenderer);
		
		var number: float = UnityEngine.Random.Range(0.0,1.0);
		material_number = Mathf.FloorToInt(material_value.curve.Evaluate(number)*material.Count);
		if (material_number > material.Count-1){material_number = material.Count-1;}
		if (!material[material_number]){return;}
		if (meshrenderer)
		{
			if (meshrenderer.sharedMaterials.Length == 0)
			{
				return 0;
			}
			meshrenderer.sharedMaterial = material[material_number];
			return material_number;
		} 
		else {return 0;}
	}
	
	function add_material(index: int)
	{
		var material1: Material = null;
		var object: GameObject = null;
		material.Insert(index,material1);
		material_value.add_value(index,50);
		combine_count.Insert(index,0);
		combine_parent.Insert(index,object);
	}
	
	function erase_material(index: int)
	{
		if (material.Count > 0)
		{
			material.RemoveAt(index);
			material_value.erase_value(index);
			combine_count.RemoveAt(index);
			combine_parent.RemoveAt(index);
		}
	}
	
	function clear_material()
	{
		material.Clear();
		material_value.clear_value();
		combine_count.Clear();
		combine_parent.Clear();
	}
}

// prefilter_class
class prefilter_class 
{
	var filter_text: String = "Filter (1)";
	var foldout: boolean = true;
	var filter_index: List.<int> = new List.<int>();
	var filters_active: boolean = true;
	var filters_foldout: boolean = true;
	
	function set_filter_text()
	{
		if (filter_index.Count < 2){filter_text = "Filter ("+filter_index.Count+")";} else {filter_text = "Filters ("+filter_index.Count+")";}
	}

}	

class auto_search_class
{
	var path_full: String;
	var display: boolean = false;
	var custom: boolean = false;
	var digits: int = 1;
	var format: String = "%n";
    var filename: String = "tile";
    var extension: String = ".raw";
    var start_x: int = 0;
    var start_y: int = 0;
    var start_n: int = 1;
    
    var output_format: String = "1";
    
    function set_output_format()
    {
    	var digit: String = new String("0"[0],digits);
    	output_format = format.Replace("%x",start_x.ToString(digit));
		output_format = output_format.Replace("%y",start_y.ToString(digit));
		output_format = output_format.Replace("%n",start_n.ToString(digit));
    }
}

// image_class
class image_class
{
	var precolor_range: precolor_range_class = new precolor_range_class(0,false);
	
	var settings_foldout: boolean = false;
	var image_number: int;
	var image: List.<Texture2D> = new List.<Texture2D>();
	var texture: Texture2D;
	var tile_offset: boolean = false;
	var image_color: Color = Color.white;
	var image_curve: AnimationCurve;
	var flip_x: boolean = false;
	var flip_y: boolean = false;
	var clamp: boolean = false;
	var list_length: int = 1;
	var list_row: int = 4;
	var image_list_mode: list_condition_enum;
	var image_mode: image_mode_enum;
	var select_mode: select_mode_enum;
	
	var image_auto_scale: boolean = true;
	var conversion_step: Vector2 = Vector2(1,1);
	var tile_x: float = 1;
	var tile_y: float = 1;
	var tile_offset_x: float = 0;
	var tile_offset_y: float = 0;
	var rgb: boolean = true;
	var rotation: boolean = false;
	var rotation_value: float = 0;
	var output: boolean;
	var output_pos: float;
	var edge_blur: boolean = false;
	var edge_blur_radius: float = 1;
	
	var alpha: float;
	
	var auto_search: auto_search_class = new auto_search_class();
	
	function image_class()
	{
		image.Add(texture);
		auto_search.extension = ".png";
	}
	
	function set_image_auto_tile(preterrain: terrain_class)
	{
		
	}
	
	function adjust_list()
	{
		var delta_list: int = list_length-image.Count;
		var count_image: int;
		
		if (delta_list > 0)
		{
			for (count_image = 0;count_image < delta_list;++count_image)
			{
				image.Add(new Texture2D(1,1));		
			}
		}
		if (delta_list < 0)
		{
			delta_list *= -1;
			for (count_image = 0;count_image < delta_list;++count_image)
			{
				image.RemoveAt(image.Count-1);
			}
		}
	}
	
	function set_image_auto_scale(preterrain1: terrain_class,area: Rect,image_number: int)
	{
		if (image_number < image.Count)
		{
			if (image[image_number] && preterrain1)
			{
				if (image_mode == image_mode_enum.Area)
				{
					conversion_step.x = area.width/(image[image_number].width-1);
					conversion_step.y = area.height/(image[image_number].height-1);
				}
				else if (image_mode == image_mode_enum.Terrain)
				{
					if (preterrain1.terrain)
					{
						conversion_step.x = preterrain1.terrain.terrainData.size.x/(image[image_number].width-1);
						conversion_step.y = preterrain1.terrain.terrainData.size.z/(image[image_number].height-1);
					}
				}
				else if (image_mode == image_mode_enum.MultiTerrain)
				{
					conversion_step.x = (preterrain1.terrain.terrainData.size.x*preterrain1.tiles.x)/(image[image_number].width-2);
					conversion_step.y = (preterrain1.terrain.terrainData.size.z*preterrain1.tiles.y)/(image[image_number].height-2);
				}
			}
		}
	}
}
	
// filter_class
class filter_class 
{
	var active: boolean = true;
	var foldout: boolean = false;
	var curve_foldout: boolean = true;
	var color_filter: Color = Color(1.5,1.5,1.5,1);
	var strength: float = 1;
	var length: int = 1;
	var linked: boolean = true;
	var device: filter_devices_enum;
	var type: condition_type_enum;
	var type2: device2_type_enum;
	var change_mode: change_mode_enum;
	var raw: raw_class;
	
	var last_value_x: float[];
	var last_value_y: float[];
	var last_pos_x: float = 4097;
	var smooth_y: boolean = false;
	var last_value_declared: boolean = false;
	
	var preimage: image_class = new image_class();
	var lerp_color_old: Color;
	
	var precurve_x_left: animation_curve_class = new animation_curve_class();
	var precurve_x_right: animation_curve_class = new animation_curve_class();
	var precurve_y: animation_curve_class = new animation_curve_class();
	var precurve_z_left: animation_curve_class = new animation_curve_class();
	var precurve_z_right: animation_curve_class = new animation_curve_class();
	
	var curve_x_left_menu_rect: Rect;
	var curve_x_right_menu_rect: Rect;
	var curve_y_menu_rect: Rect;
	var curve_z_left_menu_rect: Rect;
	var curve_z_right_menu_rect: Rect;
	
	var precurve_list: List.<animation_curve_class> = new List.<animation_curve_class>();
	var precurve: animation_curve_class = new animation_curve_class();
	var curve_position: float;
	var prerandom_curve: animation_curve_class = new animation_curve_class();
	var output: condition_output_enum;
	var range_start: float;
	var range_end: float;
	var swap_text: String = "S";
	var swap_select: boolean = false;
	var copy_select: boolean = false;
	
	var color_output_index: int = 0;
	
	var splat_range_length: int;
	var splat_range_foldout: boolean = false;
	var splat_range: splat_range_class[] = new splat_range_class[0];
	
	var presubfilter: presubfilter_class = new presubfilter_class();
	var sub_strength_set: boolean = false;

	function filter_class()
	{
		precurve_list.Add(new animation_curve_class());
		precurve_list[0].curve = new AnimationCurve().Linear(0,0,1,1);
		precurve_list.Add(new animation_curve_class());
		precurve_list[0].default_curve = new AnimationCurve(precurve_list[0].curve.keys);
		precurve_list[1].curve = new AnimationCurve().Linear(0,0,1,0);
		precurve_list[1].default_curve = new AnimationCurve(precurve_list[1].curve.keys);
		precurve_list[1].active = false;
		precurve_list[1].type = curve_type_enum.Random;
		
		precurve_x_left.curve = new AnimationCurve.Linear(-1,1,0,0);
		precurve_x_left.default_curve = new AnimationCurve(precurve_x_left.curve.keys);
		precurve_x_right.curve = new AnimationCurve.Linear(0,0,1,1);
		precurve_x_right.default_curve = new AnimationCurve(precurve_x_right.curve.keys);
		precurve_y.curve = new AnimationCurve().Linear(0,0,1,0);
		precurve_y.default_curve = new AnimationCurve(precurve_y.curve.keys);
		precurve_z_left.curve = new AnimationCurve.Linear(-1,1,0,0);
		precurve_z_left.default_curve = new AnimationCurve(precurve_z_left.curve.keys);
		precurve_z_right.curve = new AnimationCurve.Linear(0,0,1,1);
		precurve_z_right.default_curve = new AnimationCurve(precurve_z_right.curve.keys);
	}
} 

// presubfilter_class
class presubfilter_class
{
	var subfilter_text: String = "SubFilter (0)";
	var foldout: boolean = true;
	var subfilters_active: boolean = true;
	var subfilters_foldout: boolean = true;
	var subfilter_index: List.<int> = new List.<int>();
	
	function set_subfilter_text(length: int)
	{
		if (length > 1){subfilter_text = "SubFilters ("+length+")";} else {subfilter_text = "SubFilter ("+length+")";}
	}
}
	
// subfilter_class
class subfilter_class
{
	var active: boolean = true;
	var foldout: boolean;
	var color_subfilter = Color(1.5,1.5,1.5,1);
	var linked: boolean = true;
	var type: condition_type_enum;
    var output: subfilter_output_enum;
    var output_max: int = 1;
    var output_count: int;
    var output_count_min: float = 0.5;
	var strength: float = 1;
	var range_start: float = 0;
	var range_end: float = 0;
	var range_count: int = 0;
	var preimage: image_class = new image_class();
	var precolor_range: precolor_range_class = new precolor_range_class(0,false);
	var precurve_list: List.<animation_curve_class> = new List.<animation_curve_class>();
	var precurve: animation_curve_class = new animation_curve_class();
	var curve_menu_rect: Rect;
	var curve_inv: boolean = false;
	var curve_position: float;
	var prerandom_curve: animation_curve_class = new animation_curve_class();
	var random_curve_menu_rect: Rect;
	var random_curve_inv: boolean = false;
	var swap_text: String = "S";
	var swap_select: boolean = false;
	var copy_select: boolean = false;
	var from_tree: boolean = false;
	
	var raw: raw_class;
	
	var mode: subfilter_mode_enum = subfilter_mode_enum.strength;	
	var smooth: boolean = false;
	var smooth_method: smooth_method_enum;
	
	function subfilter_class()
	{
		precurve_list.Add(new animation_curve_class());
		precurve_list[0].curve = new AnimationCurve().Linear(0,0,1,1);
		precurve_list[0].default_curve = new AnimationCurve(precurve_list[0].curve.keys);
		precurve_list.Add(new animation_curve_class());
		precurve_list[1].curve = new AnimationCurve().Linear(0,0,1,0);
		precurve_list[1].default_curve = new AnimationCurve(precurve_list[1].curve.keys);
		precurve_list[1].active = false;
		precurve_list[1].type = curve_type_enum.Random;
	}	
}

// 16bit to 8bit class
class value16bit_class
{
	var hi: float;
	var lo: float;
}

class value24bit_class
{
	var hi2: float;
	var hi: float;
	var lo: float;
}

// texture tool class
class texture_tool_class
{
	var active: boolean = true;
	var preimage: image_class = new image_class();
	var resolution_display: Vector2 = Vector2(512,512);
	var scale: float = 1;
	var rect: Rect;
	var precolor_range: precolor_range_class = new precolor_range_class(0,false);
}

// pattern tool class
class pattern_tool_class
{
	var active: boolean;
	var resolution_display: Vector2 = Vector2(512,512);
	var scale: float = 1;
	var clear: boolean = true;
	var first: boolean = false;
	var place_total: int;
	
	var output_texture: Texture2D;
	var output_resolution: Vector2 = Vector2(512,512);
	var patterns: List.<pattern_class> = new List.<pattern_class>();
	var current_pattern: pattern_class = new pattern_class();
	
	var export_file: String = "";
	var export_path: String;
}

// heightmap tool class
class heightmap_tool_class
{
	var active: boolean;
	var resolution_display: Vector2 = Vector2(512,512);
	var scale: float = 1;
	var clear: boolean = true;
	var first: boolean = false;
	var place_total: int;
	var pow_strength: float;
	
	var scroll_offset: float = 0.1;
	var perlin: perlin_class = new perlin_class();
	
	var output_texture: Texture2D;
	var preview_texture: Texture2D;
	var output_resolution: float = 2049;
	var preview_resolution: float = 128;
	var preview_resolution_slider: int = 2;
	
	var export_file: String = "";
	var export_path: String;
	var export_mode: export_mode_enum;
	var raw_save_file: raw_file_class = new raw_file_class();
}

// perlin class
class perlin_class
{
	var frequency: float = 512;
	var amplitude: float = 1;
	var octaves: int = 4;
	var precurve: animation_curve_class = new animation_curve_class();
	var offset: Vector2 = new Vector2(0,0);
	var offset_begin: Vector2 = new Vector2(0,0);
	
	var curve_menu_rect: Rect;
	
	function perlin_class()
	{
		precurve.curve = new AnimationCurve.Linear(0,0,1,1);
		precurve.default_curve = new AnimationCurve(precurve.curve.keys);
	}
}

// pattern_class
class pattern_class
{
	var active: boolean = true;
	var foldout: boolean = false;
	var pattern_placed: List.<Vector2> = new List.<Vector2>();
	var output: condition_output_enum;
	
	var current_x: float = 0;
	var current_y: float = 0;
	var start_x: float;
	var start_y: float;
	var width: float;
	var height: float;
	var width2: float;
	var height2: float;
	var count_x: int = 1;
	var count_y: int = 1;
	var scale: Vector2;
	var scale_start: Vector2 = Vector2(1,1);
	var scale_end: Vector2 = Vector2(1,1);
	var scale_link: boolean = true;
	var scale_link_start_y: boolean = true;
	var scale_link_end_y: boolean = true;
	var scale_link_start_z: boolean = true;
	var scale_link_end_z: boolean = true;
	var link_scale: float;
	var color: Color = Color.white;
	var strength: float = 1;
	
	var rotate: boolean;
	var rotation: float;
	var rotation_start: float = -180;
	var rotation_end: float = 180;
	var current: Vector2;
	var pivot: Vector2;
	var precolor_range: precolor_range_class = new precolor_range_class(0,false);
	
	var break_x: boolean = false;
	
	var input_texture: Texture2D;
	var min_distance_x: float;
	var min_distance_y: float;
	var min_distance: boolean;
	var distance_global: boolean;
	var place_max: int = 100;
	var placed_max: boolean = false;
}

class settings_class
{
	var area_max: Rect = Rect(-256,-256,512,512);
	var color: color_settings_class = new color_settings_class();
	var color_scheme_display: boolean = false;
	var color_scheme_display_foldout: boolean = true;
	
	var toggle_text_no: boolean = false;
	var toggle_text_short: boolean = true;
	var toggle_text_long: boolean = false;
	var tooltip_text_no: boolean = false;
	var tooltip_text_short: boolean = false;
	var tooltip_text_long: boolean = true;
	var tooltip_mode: int = 2;
	var mac_mode: boolean = false;
	
	var remarks: boolean = true;
	var tips: boolean = true;
	
	var tip_local_area_foldout = true;
	var tip_local_area_text: String;
	
	// database
	var prelayers_linked: int = -1;
	var filters_linked: int = -1;
	var subfilters_linked: int = -1;
	var database_display: boolean = false;
	var filter_foldout_index: int = 0;
	var subfilter_foldout_index: int = 0;
	var update_display: boolean = false;
	var update_display2: boolean = false;
	var update_version: boolean = false;
	var update_version2: boolean = false;
	var old_version: float;
	var new_version: float;
	var update: String[] = ["Don't check for updates","Notify updates","Download updates and notify","Download updates,import and notify","Download updates and import automatically"];
	var time_out: float;
	
	// generate
	var grass_density: float = 32;
	var smooth_angle: int = 1;
	var round_angle: int = 0;
	var resolution_density: boolean = true;
	var resolution_density_min: int = 128;
	var resolution_density_conversion: float;
	var run_in_background: boolean = true;
	var display_bar_auto_generate: boolean = false;
	
	// shader
	var triplanar: boolean = false;
	
	var colormap: boolean = false;
	var colormap_auto_assign: boolean = false;
	var colormap_assign: boolean = true;
	var normalmap: boolean = false;
	var normalmap_auto_assign: boolean = false;
	
	// display
	var top_height: float;
	var top_rect: Rect;
	var color_scheme: boolean = true;
	var box_scheme: boolean = false;
	var display_color_curves: boolean = false;
	var display_mix_curves: boolean = true;
	var display_log: boolean = true;
	var display_filename: boolean = false;
	var filter_select_text: boolean = true;
	var display_short_terrain: boolean = false;
	
	var loading: int = 0;
    var contents: WWW;
    
    // terrain settings
    var terrain_settings: boolean = false;
    var terrain_settings_foldout: boolean = true;
    var editor_basemap_distance_max: int = 50000;
    var editor_detail_distance_max: int = 2000;
    var editor_tree_distance_max: int = 50000;
    var editor_fade_length_max: int = 400;
    var editor_mesh_trees_max: int = 1000;
    
    var runtime_basemap_distance_max: int = 50000;
    var runtime_detail_distance_max: int = 2000;
    var runtime_tree_distance_max: int = 50000;
    var runtime_fade_length_max: int = 400;
    var runtime_mesh_trees_max: int = 1000;
    
    var terrain_tiles_max: int = 5;
    
    var settings_editor: boolean = true;
    var settings_runtime: boolean = false;
    var auto_fit_terrains: boolean = false;
    
    var color_splatPrototypes: splatPrototype_class[] = new splatPrototype_class[3];
    var splat_apply_all: boolean = true;
    
    // raw
    var raw_search_pattern: String = "_x%x_y%y";
    var raw_search_filename: String = "tile";
    var raw_search_extension: String = ".raw";
}

class color_settings_class
{
	var color_description: Color = Color(1,0.45,0);
	var color_layer: Color = Color.yellow;
	var color_filter: Color = Color.cyan;
	var color_subfilter: Color = Color.green;
	var color_colormap: Color = Color.white;
	var color_splat: Color = Color.white;
	var color_tree: Color = Color(1,0.7,0.4);
	var color_tree_precolor_range: Color = Color(1,0.84,0.64);
	var color_tree_filter: Color = Color(0.5,1,1);
	var color_tree_subfilter: Color = Color(0.5,1,0.5);
	var color_grass: Color = Color.white;
	var color_object: Color = Color.white;
	var color_terrain: Color = Color.white;
}

// prelayer functions
function add_prelayer(search_level: boolean)
{
	prelayers.Add(new prelayer_class(0,prelayers.Count));
	prelayers[prelayers.Count-1].index = prelayers.Count-1;
	prelayers[prelayers.Count-1].prearea.area_max = settings.area_max;
	prelayers[prelayers.Count-1].prearea.max();
	prelayers[prelayers.Count-1].set_prelayer_text();
	if (search_level){search_level_prelayer(0,prelayers.Count-1,0);}
}

function erase_prelayer(prelayer_index: int)
{
	erase_layers(prelayers[prelayer_index]);
	if (prelayer_index < prelayers.Count-1){swap_prelayer1(prelayer_index,prelayers.Count-1);}
	prelayers.RemoveAt(prelayers.Count-1);
	
	if (prelayer_index < prelayers.Count)
	{
		search_prelayer(prelayer_index);
		prelayers[prelayer_index].index = prelayer_index;
		prelayers[prelayer_index].set_prelayer_text();
	}
}

function search_prelayer(prelayer_index: int)
{
	for (var count_prelayer: int = 0;count_prelayer < prelayers.Count;++count_prelayer)
	{
		for (var count_layer: int = 0;count_layer < prelayers[count_prelayer].layer.Count;++count_layer)
		{
			for (var count_object: int = 0;count_object < prelayers[count_prelayer].layer[count_layer].object_output.object.Count;++count_object)
			{
				if (prelayers[count_prelayer].layer[count_layer].object_output.object[count_object].prelayer_index == prelayers.Count)
				{
					prelayers[count_prelayer].layer[count_layer].object_output.object[count_object].prelayer_index = prelayer_index;
					return;
				}
			}
		}
	}
}

function search_level_prelayer(prelayer_index: int,find_index: int,level: int)
{
	for (var count_layer: int = 0;count_layer < prelayers[prelayer_index].layer.Count;++count_layer)
	{
		for (var count_object: int = 0;count_object < prelayers[prelayer_index].layer[count_layer].object_output.object.Count;++count_object)
		{
			if (prelayers[prelayer_index].layer[count_layer].object_output.object[count_object].prelayer_created)
			{
				++level;
				if (prelayers[prelayer_index].layer[count_layer].object_output.object[count_object].prelayer_index == find_index)
				{
					prelayers[prelayers[prelayer_index].layer[count_layer].object_output.object[count_object].prelayer_index].level = level;
					return;
				}
				search_level_prelayer(prelayers[prelayer_index].layer[count_layer].object_output.object[count_object].prelayer_index,find_index,level);
				--level;
			}
		}
	}
}

function swap_prelayer1(prelayer_index1: int,prelayer_index2: int)
{
	var prelayer2: prelayer_class = prelayers[prelayer_index1];
	
	prelayers[prelayer_index1] = prelayers[prelayer_index2];
	prelayers[prelayer_index2] = prelayers[prelayer_index1];
}

// description functions
function new_layergroup(prelayer1: prelayer_class,description_number:int)
{
	var length: int = prelayer1.predescription.description[description_number].layer_index.Count;
	
	for (var count_layer: int = 0;count_layer < length;++count_layer)
	{
		erase_layer(prelayer1,prelayer1.predescription.description[description_number].layer_index[0],description_number,0,true,true,false);
	}
}

function erase_description(prelayer1: prelayer_class,description_number: int)
{
	if (prelayer1.predescription.description.Count > 1)
	{
		var length: int = prelayer1.predescription.description[description_number].layer_index.Count;
		
		for (var count_layer_index: int = 0;count_layer_index < length;++count_layer_index)
		{
			erase_layer(prelayer1,prelayer1.predescription.description[description_number].layer_index[0],description_number,0,true,true,false);
		}
	
		prelayer1.predescription.erase_description(description_number);
	}
	count_layers();
}

function swap_description(description_number1: int,description_number2: int,prelayer1: prelayer_class)
{
	if (description_number2 < 0 || description_number2 > prelayer1.predescription.description.Count-1){return;}
	var length1: int = prelayer1.predescription.description[description_number1].layer_index.Count;
	var length2: int = prelayer1.predescription.description[description_number2].layer_index.Count;
	
	var count: int;
	
	var text: String = prelayer1.predescription.description[description_number1].text;
	
	prelayer1.predescription.description[description_number1].text = prelayer1.predescription.description[description_number2].text;
	prelayer1.predescription.description[description_number2].text = text;
	
	var foldout2: boolean = prelayer1.predescription.description[description_number1].foldout;
	
	prelayer1.predescription.description[description_number1].foldout = prelayer1.predescription.description[description_number2].foldout;
	prelayer1.predescription.description[description_number2].foldout = foldout2;
	
	for (count = 0;count < length1;++count)
	{
		replace_layer(0,description_number1,description_number2,prelayer1);
	}
	for (count = 0;count < length2;++count)
	{
		replace_layer(0,description_number2,description_number1,prelayer1);
	}
	
	prelayer1.predescription.set_description_enum();
}
	
// layer functions
function replace_layer(source_layer_index: int,source_description_number: int,target_description_number: int,prelayer1: prelayer_class)
{
	var target_layer_number: int = get_layer_position(prelayer1.predescription.description[target_description_number].layer_index.Count,target_description_number,prelayer1);
	add_layer(prelayer1,target_layer_number,layer_output_enum.color,target_description_number,prelayer1.predescription.description[target_description_number].layer_index.Count,false,false);
        
    prelayer1.layer[target_layer_number] = copy_layer(prelayer1.layer[prelayer1.predescription.description[source_description_number].layer_index[source_layer_index]],true,true);
    erase_layer(prelayer1,prelayer1.predescription.description[source_description_number].layer_index[source_layer_index],source_description_number,source_layer_index,true,true,true);
}

function count_layers()
{
	if (!layer_count){return;}
	layer_heightmap = layer_color = layer_splat = layer_tree = layer_grass = layer_object = 0;
	
	for (var count_prelayer: int = 0;count_prelayer < prelayers.Count;++count_prelayer)
	{
		for (var count_layer: int = 0;count_layer < prelayers[count_prelayer].layer.Count;++count_layer)
		{
			switch(prelayers[count_prelayer].layer[count_layer].output)
			{
				case layer_output_enum.heightmap:
					++layer_heightmap;
					break;
				case layer_output_enum.color:
					++layer_color;
					break;
				case layer_output_enum.splat:
					++layer_splat;
					break;
				case layer_output_enum.tree:
					++layer_tree;
					break;
				case layer_output_enum.grass:
					++layer_grass;
					break;
				case layer_output_enum.object:
					++layer_object;
					break;
			}
		}
	}
}
	
function erase_layers(prelayer1: prelayer_class)
{
	var length: int = prelayer1.layer.Count;
	for (var count_layer: int = 0;count_layer < length;++count_layer)
	{
		erase_layer(prelayer1,0,0,0,false,true,false);	
	}
}

function erase_layer(prelayer1: prelayer_class,layer_number: int,description_number: int,layer_index: int,description: boolean,loop_layer: boolean,count_layer: boolean)
{
	if (prelayer1.layer.Count > 0)
	{
		if (loop_layer){loop_layer(prelayer1.layer[layer_number],-1);}
		erase_filters(prelayer1.layer[layer_number].prefilter);
		for (var count_tree: int = 0;count_tree < prelayer1.layer[layer_number].tree_output.tree.Count;++count_tree)
		{
			erase_filters(prelayer1.layer[layer_number].tree_output.tree[count_tree].prefilter);
		}
		prelayer1.layer.RemoveAt(layer_number);
	} 
	// description
	if (description){prelayer1.predescription.erase_layer_index(layer_number,layer_index,description_number);}
	if (count_layer){count_layers();}
	prelayer1.set_prelayer_text();
}

function strip_layer(prelayer1: prelayer_class,layer_number: int)
{
	for (var count_object: int = 0;count_object < prelayer1.layer[layer_number].object_output.object.Count;++count_object)
	{
		if (prelayer1.layer[layer_number].object_output.object[count_object].prelayer_created)
		{
			erase_prelayer(prelayer1.layer[layer_number].object_output.object[count_object].prelayer_index);
		}
	}
	erase_filters(prelayer1.layer[layer_number].prefilter);
	
}

function add_layer(prelayer1: prelayer_class,layer_number: int,layer_output: layer_output_enum,description_number: int,layer_index: int,new_filter: boolean,count_layer: boolean)
{
	prelayer1.layer.Insert(layer_number,new layer_class());
	if (new_filter)
	{
		add_filter(0,prelayer1.layer[layer_number].prefilter);
	}
	prelayer1.layer[layer_number].output = layer_output;
	
	// description
	prelayer1.predescription.add_layer_index(layer_number,layer_index,description_number);
	
	if (count_layer){count_layers();}
	prelayer1.set_prelayer_text();
	
	// heightmap settings
	if (layer_output == layer_output_enum.heightmap)
	{
		if (new_filter)
		{
			filter[filter.Count-1].type = condition_type_enum.Always;
			
			filter[filter.Count-1].precurve_list[0].curve = new AnimationCurve().Linear(0,1,1,1);
			filter[filter.Count-1].precurve_list[0].default_curve = new AnimationCurve(filter[filter.Count-1].precurve_list[0].curve.keys);
			filter[filter.Count-1].precurve_list[1].curve = new AnimationCurve().Linear(0,0,1,1);
			filter[filter.Count-1].precurve_list[1].default_curve = new AnimationCurve(filter[filter.Count-1].precurve_list[0].curve.keys);
			filter[filter.Count-1].precurve_list[0].type = curve_type_enum.Perlin;
			filter[filter.Count-1].precurve_list[1].type = curve_type_enum.Normal;
		}
	}
}

function swap_layer(prelayer1: prelayer_class,layer_number1: int,prelayer2: prelayer_class,layer_number2: int)
{
	if (layer_number2 < 0 || layer_number2 > prelayer2.layer.Count-1){return;}
	
	var layer2: layer_class = prelayer1.layer[layer_number1];
	prelayer1.layer[layer_number1] = prelayer2.layer[layer_number2];
	prelayer2.layer[layer_number2] = layer2;
	if (prelayer1.layer[layer_number1].color_layer[0] < 1.5){prelayer1.layer[layer_number1].color_layer += Color (1,1,1,1);}
	if (prelayer2.layer[layer_number2].color_layer[0] < 1.5){prelayer2.layer[layer_number2].color_layer += Color (1,1,1,1);}
}

function get_layer_position(layer_index: int,description_number: int,prelayer1: prelayer_class): int
{
	var layer_position: int = 0;
	for (var count_description: int = 0;count_description < prelayer1.predescription.description.Count;++count_description)
	{
		if (count_description == description_number){return (layer_position+layer_index);}
		layer_position += prelayer1.predescription.description[count_description].layer_index.Count;
	}
	return -1;
}

function get_layer_description(prelayer1: prelayer_class,layer_index: int): int
{
	for (var count_description: int = 0;count_description < prelayer1.predescription.description.Count;++count_description)
	{
		for (var count_layer: int = 0;count_layer < prelayer1.predescription.description[count_description].layer_index.Count;++count_layer)
		{
			if (prelayer1.predescription.description[count_description].layer_index[count_layer] == layer_index){return count_description;}
		}
	}
	return -1;
}

function layer_sort(prelayer: prelayer_class,description_number: int)
{
	var sort_low: int;
	var sort_set1: boolean = false;
	var sort_set2: boolean = false;
	var sort_set3: boolean = false;
	var sort_set4: boolean = false;
	var sort_set5: boolean = false;
	var sort_set6: boolean = false;
	var sort_pos1: int;
	var sort_pos2: int;
	var sort_pos3: int;
	var sort_pos4: int;
	var sort_pos5: int;
	var sort_pos6: int;
	for (var count_layer: int = 0;count_layer < prelayer.predescription.description[description_number].layer_index.Count;++count_layer)
	{
		sort_set1 = false;
		sort_set2 = false;
		sort_set3 = false;
		sort_set4 = false;
		sort_set5 = false;
		sort_set6 = false;
		
		for (var count_layer2: int = count_layer;count_layer2 < prelayer.predescription.description[description_number].layer_index.Count;++count_layer2)
		{
			if (!sort_set1){if (prelayer.layer[prelayer.predescription.description[description_number].layer_index[count_layer2]].output == layer_output_enum.heightmap){sort_pos1 = count_layer2;sort_set1 = true;}}
			if (!sort_set2){if (prelayer.layer[prelayer.predescription.description[description_number].layer_index[count_layer2]].output == layer_output_enum.color){sort_pos2 = count_layer2;sort_set2 = true;}}
			if (!sort_set3){if (prelayer.layer[prelayer.predescription.description[description_number].layer_index[count_layer2]].output == layer_output_enum.splat){sort_pos3 = count_layer2;sort_set3 = true;}}
			if (!sort_set4){if (prelayer.layer[prelayer.predescription.description[description_number].layer_index[count_layer2]].output == layer_output_enum.tree){sort_pos4 = count_layer2;sort_set4 = true;}}
			if (!sort_set5){if (prelayer.layer[prelayer.predescription.description[description_number].layer_index[count_layer2]].output == layer_output_enum.grass){sort_pos5 = count_layer2;sort_set5 = true;}}
			if (!sort_set6){if (prelayer.layer[prelayer.predescription.description[description_number].layer_index[count_layer2]].output == layer_output_enum.object){sort_pos6 = count_layer2;sort_set6 = true;}}
		}
		if (sort_set1){swap_layer(prelayer,prelayer.predescription.description[description_number].layer_index[count_layer],prelayer,prelayer.predescription.description[description_number].layer_index[sort_pos1]);}
			else if (sort_set2){swap_layer(prelayer,prelayer.predescription.description[description_number].layer_index[count_layer],prelayer,prelayer.predescription.description[description_number].layer_index[sort_pos2]);}
				else if (sort_set3){swap_layer(prelayer,prelayer.predescription.description[description_number].layer_index[count_layer],prelayer,prelayer.predescription.description[description_number].layer_index[sort_pos3]);}
					else if (sort_set4){swap_layer(prelayer,prelayer.predescription.description[description_number].layer_index[count_layer],prelayer,prelayer.predescription.description[description_number].layer_index[sort_pos4]);}
						else if (sort_set5){swap_layer(prelayer,prelayer.predescription.description[description_number].layer_index[count_layer],prelayer,prelayer.predescription.description[description_number].layer_index[sort_pos5]);}
							else if (sort_set6){swap_layer(prelayer,prelayer.predescription.description[description_number].layer_index[count_layer],prelayer,prelayer.predescription.description[description_number].layer_index[sort_pos6]);}				
	}
}

function layers_sort(prelayer: prelayer_class)
{
	for (var count_description: int = 0;count_description < prelayer.predescription.description.Count;++count_description)
	{
		layer_sort(prelayer,count_description);
	}
}

function erase_filters(prefilter: prefilter_class)
{
	var length: int = prefilter.filter_index.Count;
	
	for (var count_filter: int = 0;count_filter < length;++count_filter)
	{
		erase_filter(0,prefilter);
	}
}

function add_filter(filter_number: int,prefilter: prefilter_class)
{
	filter.Add(new filter_class());
	prefilter.filter_index.Insert(filter_number,filter.Count-1);
	
	if (terrains.Count > 1){filter[filter.Count-1].preimage.image_mode = image_mode_enum.MultiTerrain;}

	prefilter.set_filter_text();	
}

function add_animation_curve(precurve_list: List.<animation_curve_class>,curve_number: int,copy: boolean)
{
	if (!copy)
	{
		precurve_list.Insert(curve_number,new animation_curve_class());
		precurve_list[curve_number].curve = new AnimationCurve.Linear(0,0,1,0);
		precurve_list[curve_number].default_curve = new AnimationCurve(precurve_list[curve_number].curve.keys);
	}
	else 
	{
		precurve_list.Insert(curve_number,copy_animation_curve(precurve_list[curve_number-1]));
	}
}

function erase_animation_curve(precurve_list: List.<animation_curve_class>,curve_number: int)
{
	if (precurve_list.Count > 0)
	{
		precurve_list.RemoveAt(curve_number);
	}
}

function swap_animation_curve(curve_list: List.<animation_curve_class>,curve_number1: int,curve_number2: int)
{
	var curve3: animation_curve_class = curve_list[curve_number1];
	
	curve_list[curve_number1] = curve_list[curve_number2];
	curve_list[curve_number2] = curve3;
}

function erase_filter(filter_number: int,prefilter: prefilter_class)
{
	if (prefilter.filter_index.Count > 0)
	{
		erase_subfilters(filter[prefilter.filter_index[filter_number]]);
		var filter_index: int = prefilter.filter_index[filter_number];
		swap_filter2(filter_index,filter.Count-1,false);
		filter.RemoveAt(filter.Count-1);
		prefilter.filter_index.RemoveAt(filter_number);
		relink_filter_index(filter_index);
		prefilter.set_filter_text();
	}
}

function erase_filter_reference(prefilter: prefilter_class,filter_index: int)
{
	prefilter.filter_index.RemoveAt(filter_index);
	prefilter.set_filter_text();	
}

function erase_filter_unlinked(filter_number: int)
{
		swap_filter2(filter_number,filter.Count-1,false);
		filter.RemoveAt(filter.Count-1);
		relink_filter_index(filter_number);
}

function swap_filter(prefilter1: prefilter_class,filter_index1: int,prefilter2: prefilter_class,filter_index2: int)
{
	if (filter_index2 < 0 || filter_index2 > prefilter2.filter_index.Count-1){return;}
	
	var filter2: filter_class = filter[prefilter1.filter_index[filter_index1]];
	filter[prefilter1.filter_index[filter_index1]] = filter[prefilter2.filter_index[filter_index2]];
	filter[prefilter2.filter_index[filter_index2]] = filter2;
	if (filter[prefilter1.filter_index[filter_index1]].color_filter[0] < 1.5){filter[prefilter1.filter_index[filter_index1]].color_filter += Color(1,1,1,1);}
	if (filter[prefilter2.filter_index[filter_index2]].color_filter[0] < 1.5){filter[prefilter2.filter_index[filter_index2]].color_filter += Color(1,1,1,1);}
}

function swap_filter2(filter_number1: int,filter_number2: int,blink: boolean)
{
	var filter2: filter_class = filter[filter_number1];
	filter[filter_number1] = filter[filter_number2];
	filter[filter_number2] = filter2;
	if (blink)
	{
		if (filter[filter_number1].color_filter[0] < 1.5){filter[filter_number1].color_filter += Color(1,1,1,1);}
		if (filter[filter_number2].color_filter[0] < 1.5){filter[filter_number2].color_filter += Color(1,1,1,1);}
	}
}

function swap_object(object_output1: object_output_class,object_number1: int,object_output2: object_output_class,object_number2: int)
{
	var object2: object_class = object_output1.object[object_number1];
	var object_value2: float = object_output1.object_value.value[object_number1];
	var object_active2: boolean = object_output1.object_value.active[object_number1];
	
	object_output1.object[object_number1] = object_output2.object[object_number2];
	object_output2.object[object_number2] = object2;
	if (object_output1.object[object_number1].color_object[0] > 0.5){object_output1.object[object_number1].color_object += Color(-0.5,0,-0.5,0);}
	if (object_output2.object[object_number2].color_object[0] > 0.5){object_output2.object[object_number2].color_object += Color(-0.5,0,-0.5,0);}
	object_output1.object_value.value[object_number1] = object_output2.object_value.value[object_number2];
	object_output2.object_value.value[object_number2] = object_value2;
	object_output1.object_value.active[object_number1] = object_output2.object_value.active[object_number2];
	object_output2.object_value.active[object_number2] = object_active2;
	object_output1.object_value.calc_value();
	if (object_output1 != object_output2){object_output2.object_value.calc_value();}
}

function swap_tree(tree_output1: tree_output_class,tree_number1: int,tree_output2: tree_output_class,tree_number2: int)
{
	var tree2: tree_class = tree_output1.tree[tree_number1];
	var tree_value2: float = tree_output1.tree_value.value[tree_number1];
	var tree_active2: boolean = tree_output1.tree_value.active[tree_number1];
	
	tree_output1.tree[tree_number1] = tree_output2.tree[tree_number2];
	tree_output2.tree[tree_number2] = tree2;
	if (tree_output1.tree[tree_number1].color_tree[0] < 1.5){tree_output1.tree[tree_number1].color_tree += Color(0.5,0.5,0.5,0);}
	if (tree_output2.tree[tree_number2].color_tree[0] < 1.5){tree_output2.tree[tree_number2].color_tree += Color(0.5,0.5,0.5,0);}
	tree_output1.tree_value.value[tree_number1] = tree_output2.tree_value.value[tree_number2];
	tree_output2.tree_value.value[tree_number2] = tree_value2;
	tree_output1.tree_value.active[tree_number1] = tree_output2.tree_value.active[tree_number2];
	tree_output2.tree_value.active[tree_number2] = tree_active2;
	tree_output1.tree_value.calc_value();
	if (tree_output1 != tree_output2){tree_output2.tree_value.calc_value();}
}

function add_object(object_output: object_output_class,object_number: int)
{
	object_output.object.Insert(object_number,new object_class());		
	object_output.object_value.add_value(object_number,50);
	object_output.set_object_text();
}
	
function erase_object(object_output: object_output_class,object_number: int)
{
	if (object_output.object.Count > 0)
	{
		if (object_output.object[object_number].prelayer_created)
		{
			erase_prelayer(object_output.object[object_number].prelayer_index);
		}
		object_output.object.RemoveAt(object_number);
		object_output.object_value.erase_value(object_number);
		object_output.set_object_text();
	}
}

function clear_object(object_output: object_output_class)
{
	var length: int = object_output.object.Count;
	
	for (var count_object: int = 0;count_object < length;++count_object)
	{
		erase_object(object_output,object_output.object.Count-1);
	}
}

function swap_color_range(precolor_range1: precolor_range_class,color_range_number1: int,precolor_range2: precolor_range_class,color_range_number2: int)
{
	var color_range2: color_range_class = precolor_range1.color_range[color_range_number1];
	var color_range_value2: float = precolor_range1.color_range_value.value[color_range_number1];
	var color_range_active2: boolean = precolor_range1.color_range_value.active[color_range_number1];
	
	precolor_range1.color_range[color_range_number1] = precolor_range2.color_range[color_range_number2];
	precolor_range2.color_range[color_range_number2] = color_range2;
	
	if (precolor_range1.color_range[color_range_number1].color_color_range[0] < 1.5){precolor_range1.color_range[color_range_number1].color_color_range += Color(1,1,1,1);}
	if (precolor_range2.color_range[color_range_number2].color_color_range[0] < 1.5){precolor_range2.color_range[color_range_number2].color_color_range += Color(1,1,1,1);}
	
	precolor_range1.color_range_value.value[color_range_number1] = precolor_range2.color_range_value.value[color_range_number2];
	precolor_range2.color_range_value.value[color_range_number2] = color_range_value2;
	
	precolor_range1.color_range_value.active[color_range_number1] = precolor_range2.color_range_value.active[color_range_number2];
	precolor_range2.color_range_value.active[color_range_number2] = color_range_active2;
	
	precolor_range1.color_range_value.calc_value();
	precolor_range1.set_precolor_range_curve();
	if (precolor_range1 != precolor_range2){precolor_range2.color_range_value.calc_value();precolor_range2.set_precolor_range_curve();}
	if (precolor_range1.one_color){precolor_range1.color_range[color_range_number1].one_color = true;}
	if (precolor_range2.one_color){precolor_range2.color_range[color_range_number2].one_color = true;}
}

function change_filters_active(prefilter: prefilter_class,invert: boolean)
{
	for (var count_filter: int = 0;count_filter < prefilter.filter_index.Count;++count_filter)
	{
		if (!invert)
		{
			filter[prefilter.filter_index[count_filter]].active = prefilter.filters_active;
		}
		else
		{
			filter[prefilter.filter_index[count_filter]].active = !filter[prefilter.filter_index[count_filter]].active;
		}
	}
}

function change_filters_foldout(prefilter: prefilter_class,invert: boolean)
{
	for (var count_filter: int = 0;count_filter < prefilter.filter_index.Count;++count_filter)
	{
		if (!invert)
		{
			filter[prefilter.filter_index[count_filter]].foldout = prefilter.filters_foldout;
		}
		else
		{
			filter[prefilter.filter_index[count_filter]].foldout = !filter[prefilter.filter_index[count_filter]].foldout;
		}
	}
}

function change_subfilters_active(presubfilter: presubfilter_class,invert: boolean)
{
	for (var count_subfilter: int = 0;count_subfilter < presubfilter.subfilter_index.Count;++count_subfilter)
	{
		if (!invert)
		{
			subfilter[presubfilter.subfilter_index[count_subfilter]].active = presubfilter.subfilters_active;
		}
		else
		{
			subfilter[presubfilter.subfilter_index[count_subfilter]].active = !subfilter[presubfilter.subfilter_index[count_subfilter]].active;
		}
	}
}

function change_subfilters_foldout(presubfilter: presubfilter_class,invert: boolean)
{
	for (var count_subfilter: int = 0;count_subfilter < presubfilter.subfilter_index.Count;++count_subfilter)
	{
		if (!invert)
		{
			subfilter[presubfilter.subfilter_index[count_subfilter]].foldout = presubfilter.subfilters_foldout;
		}
		else
		{
			subfilter[presubfilter.subfilter_index[count_subfilter]].foldout = !subfilter[presubfilter.subfilter_index[count_subfilter]].foldout;	
		}
	}
}

function change_terrains_active(invert: boolean)
{
	for (var count_terrain: int = 0;count_terrain < terrains.Count;++count_terrain)
	{
		if (!invert)
		{
			terrains[count_terrain].active = terrains_active;
		}
		else
		{
			terrains[count_terrain].active = !terrains[count_terrain].active;
		}
	}
}

function change_terrains_foldout(invert: boolean)
{
	for (var count_terrain: int = 0;count_terrain < terrains.Count;++count_terrain)
	{
		if (!invert)
		{
			terrains[count_terrain].foldout = terrains_foldout2;
		}
		else
		{
			terrains[count_terrain].foldout = !terrains[count_terrain].foldout;
		}
	}
}

function change_trees_active(tree_output: tree_output_class,invert: boolean)
{
	for (var count_tree: int = 0;count_tree < tree_output.tree.Count;++count_tree)
	{
		if (!invert)
		{
			tree_output.tree_value.active[count_tree] = tree_output.trees_active;
		}
		else
		{
			tree_output.tree_value.active[count_tree] = !tree_output.tree_value.active[count_tree];
		}
	}
	tree_output.tree_value.calc_value();
}

function change_trees_foldout(tree_output: tree_output_class,invert: boolean)
{
	for (var count_tree: int = 0;count_tree < tree_output.tree.Count;++count_tree)
	{
		if (!invert)
		{
			tree_output.tree[count_tree].foldout = tree_output.trees_foldout;
		}
		else
		{
			tree_output.tree[count_tree].foldout = !tree_output.tree[count_tree].foldout;
		}
	}
}

function change_trees_settings_foldout(preterrain1: terrain_class,invert: boolean)
{
	for (var count_tree: int = 0;count_tree < preterrain1.treePrototypes.Count;++count_tree)
	{
		if (!invert)
		{
			preterrain1.treePrototypes[count_tree].foldout = preterrain1.trees_foldout;	
		}
		else
		{
			preterrain1.treePrototypes[count_tree].foldout = !preterrain1.treePrototypes[count_tree].foldout;
		}
	}
}

function change_splats_settings_foldout(preterrain1: terrain_class,invert: boolean)
{
	for (var count_splat: int = 0;count_splat < preterrain1.splatPrototypes.Count;++count_splat)
	{
		if (!invert)
		{
			preterrain1.splatPrototypes[count_splat].foldout = preterrain1.splats_foldout;	
		}
		else
		{
			preterrain1.splatPrototypes[count_splat].foldout = !preterrain1.splatPrototypes[count_splat].foldout;
		}
	}
}

function change_color_splats_settings_foldout(preterrain1: terrain_class,invert: boolean)
{
	for (var count_splat: int = 0;count_splat < settings.color_splatPrototypes.Length;++count_splat)
	{
		if (!invert)
		{
			settings.color_splatPrototypes[count_splat].foldout = preterrain1.splats_foldout;	
		}
		else
		{
			settings.color_splatPrototypes[count_splat].foldout = !settings.color_splatPrototypes[count_splat].foldout;
		}
	}
}

function change_details_settings_foldout(preterrain1: terrain_class,invert: boolean)
{
	for (var count_detail: int = 0;count_detail < preterrain1.detailPrototypes.Count;++count_detail)
	{
		if (!invert)
		{
			preterrain1.detailPrototypes[count_detail].foldout = preterrain1.details_foldout;	
		}
		else
		{
			preterrain1.detailPrototypes[count_detail].foldout = !preterrain1.detailPrototypes[count_detail].foldout;
		}
	}
}

function change_objects_active(object_output: object_output_class,invert: boolean)
{
	for (var count_object: int = 0;count_object < object_output.object.Count;++count_object)
	{
		if (!invert)
		{
			object_output.object_value.active[count_object] = object_output.objects_active;
		}
		else
		{
			object_output.object_value.active[count_object] = !object_output.object_value.active[count_object];
		}
	}
	object_output.object_value.calc_value();
}

function change_objects_foldout(object_output: object_output_class,invert: boolean)
{
	for (var count_object: int = 0;count_object < object_output.object.Count;++count_object)
	{
		if (!invert)
		{
			object_output.object[count_object].foldout = object_output.objects_foldout;	
		}
		else
		{
			object_output.object[count_object].foldout = !object_output.object[count_object].foldout;
		}
	}
}

function change_color_ranges_active(precolor_range: precolor_range_class,invert: boolean)
{
	for (var count_color_range: int = 0;count_color_range < precolor_range.color_range.Count;++count_color_range)
	{
		if (!invert)
		{
			precolor_range.color_range_value.active[count_color_range] = precolor_range.color_ranges_active;
		}
		else
		{
			precolor_range.color_range_value.active[count_color_range] = !precolor_range.color_range_value.active[count_color_range];
		}
	}
}

// subfilter functions
function erase_subfilters(filter: filter_class)
{
	var length: int = filter.presubfilter.subfilter_index.Count;
	var subfilter_index: int;
	for (var count_subfilter: int = 0;count_subfilter < length;++count_subfilter)
	{	
		erase_subfilter(0,filter.presubfilter);
	}
}

function add_subfilter(subfilter_number: int,presubfilter: presubfilter_class)
{
	subfilter.Add(new subfilter_class());
	presubfilter.subfilter_index.Insert(subfilter_number,subfilter.Count-1);
	
	if (terrains.Count > 1){subfilter[subfilter.Count-1].preimage.image_mode = image_mode_enum.MultiTerrain;}
	
	presubfilter.set_subfilter_text(presubfilter.subfilter_index.Count);	
}

function add_line_point(line_list: List.<line_list_class>,line_point_number: int)
{
	line_list.Insert(line_point_number,new line_list_class());
}

function erase_line_point(line_list: List.<line_list_class>,line_point_number: int)
{
	line_list.RemoveAt(line_point_number);
}

function erase_subfilter(subfilter_number: int,presubfilter: presubfilter_class)
{
	if (presubfilter.subfilter_index.Count > 0)
	{
		var subfilter_index: int = presubfilter.subfilter_index[subfilter_number];
		swap_subfilter2(subfilter_index,subfilter.Count-1,false);
		subfilter.RemoveAt(subfilter.Count-1);
		presubfilter.subfilter_index.RemoveAt(subfilter_number);
		relink_subfilter_index(subfilter_index);
		presubfilter.set_subfilter_text(presubfilter.subfilter_index.Count);
	}
}

function erase_subfilter_reference(presubfilter: presubfilter_class,subfilter_index: int)
{
	presubfilter.subfilter_index.RemoveAt(subfilter_index);
	presubfilter.set_subfilter_text(presubfilter.subfilter_index.Count);
}

function erase_subfilter_unlinked(subfilter_number: int)
{
	swap_subfilter2(subfilter_number,subfilter.Count-1,false);
	subfilter.RemoveAt(subfilter.Count-1);
	relink_subfilter_index(subfilter_number);
}

function swap_subfilter(presubfilter1: presubfilter_class,subfilter_index1: int,presubfilter2: presubfilter_class,subfilter_index2: int)
{
	if (subfilter_index2 < 0 || subfilter_index2 > presubfilter2.subfilter_index.Count-1){return;}
	
	var subfilter2: subfilter_class = subfilter[presubfilter1.subfilter_index[subfilter_index1]];
	subfilter[presubfilter1.subfilter_index[subfilter_index1]] = subfilter[presubfilter2.subfilter_index[subfilter_index2]];
	subfilter[presubfilter2.subfilter_index[subfilter_index2]] = subfilter2;
	if (subfilter[presubfilter1.subfilter_index[subfilter_index1]].color_subfilter[0] < 1.5){subfilter[presubfilter1.subfilter_index[subfilter_index1]].color_subfilter += Color(1,1,1,1);}
	if (subfilter[presubfilter2.subfilter_index[subfilter_index2]].color_subfilter[0] < 1.5){subfilter[presubfilter2.subfilter_index[subfilter_index2]].color_subfilter += Color(1,1,1,1);}
}

function swap_subfilter2(subfilter_number1: int,subfilter_number2: int,blink: boolean)
{
	var subfilter2: subfilter_class = subfilter[subfilter_number1];
	subfilter[subfilter_number1] = subfilter[subfilter_number2];
	subfilter[subfilter_number2] = subfilter2;
	if (blink)
	{
		if (subfilter[subfilter_number1].color_subfilter[0] < 1.5){subfilter[subfilter_number1].color_subfilter += Color(1,1,1,1);}
		if (subfilter[subfilter_number2].color_subfilter[0] < 1.5){subfilter[subfilter_number2].color_subfilter += Color(1,1,1,1);}
	}
}

function new_layers()
{
	filter.Clear();
	subfilter.Clear();
	prelayers.Clear();
	reset_swapcopy();
	prelayers.Add(new prelayer_class(1,0));
	prelayer = prelayers[0];
	prelayer.prearea.active = false;
	filename = String.Empty;
	set_area_resolution(terrains[0],prelayer.prearea);
	add_filter(0,prelayers[0].layer[0].prefilter);
	settings.colormap = false;
	count_layers();
}

function reset_paths()
{
	raw_path = String.Empty;
	raw_save_path = String.Empty;
	terrain_path = String.Empty;
	export_path = String.Empty;
	heightmap_tool.export_path = String.Empty;
	pattern_tool.export_path = String.Empty;
}

function reset_swapcopy()
{
	swap_layer_select = false;
	swap_filter_select = false;
	swap_subfilter_select = false;
	swap_object_select = false;
	swap_color_range_select = false;
	swap_description_select = false;
	copy_layer_select = false;
	copy_filter_select = false;
	copy_subfilter_select = false;
	copy_object_select = false;
	copy_color_range_select = false;
	copy_description_select = false;
	
	for (var count_filter: int = 0;count_filter < filter.Count;++count_filter)
	{
		for (var count_curve: int = 0;count_curve < filter[count_filter].precurve_list.Count;++count_curve)
		{
			filter[count_filter].precurve_list[count_curve].curve_text = "Curve";
		}
	}
	
	for (var count_subfilter: int = 0;count_subfilter < subfilter.Count;++count_subfilter)
	{
		for (count_curve = 0;count_curve < subfilter[count_subfilter].precurve_list.Count;++count_curve)
		{
			subfilter[count_subfilter].precurve_list[count_curve].curve_text = "Curve";
		}
	}
}

function reset_software_version()
{
	software_id = 0;
	for (var count_prelayer: int = 0;count_prelayer < prelayers.Count;++count_prelayer)
	{
		for (var count_layer: int = 0;count_layer < prelayers[count_prelayer].layer.Count;++count_layer)
		{
			prelayers[count_prelayer].layer[count_layer].software_id = 0;
		}
	}
}

function get_output_length(layer: layer_class): int
{
	if (layer.output == layer_output_enum.heightmap){return 0;}
	if (layer.output == layer_output_enum.color){return 0;} 
	if (layer.output == layer_output_enum.splat){return layer.splat_output.splat.Count;}
	if (layer.output == layer_output_enum.tree){return layer.tree_output.tree.Count;}
	if (layer.output == layer_output_enum.grass){return layer.grass_output.grass.Count;}
	if (layer.output == layer_output_enum.object){return layer.object_output.object.Count;}
	return -1;
}

function set_view_only_selected(prelayer: prelayer_class,selected: layer_output_enum)
{
	prelayer.view_heightmap_layer = prelayer.view_color_layer = prelayer.view_splat_layer = prelayer.view_tree_layer = prelayer.view_grass_layer = prelayer.view_object_layer = false;
	if (selected == layer_output_enum.heightmap){prelayer.view_heightmap_layer = true;}
	if (selected == layer_output_enum.color){prelayer.view_color_layer = true;}
	if (selected == layer_output_enum.splat){prelayer.view_splat_layer = true;}
	if (selected == layer_output_enum.tree){prelayer.view_tree_layer = true;}
	if (selected == layer_output_enum.grass){prelayer.view_grass_layer = true;}
	if (selected == layer_output_enum.object){prelayer.view_object_layer = true;}
}	

function swap_search_layer(prelayer1: prelayer_class,prelayer2: prelayer_class,layer: layer_class,text1: String,text2: String): boolean
{
	if (prelayer2.index > 0)
	{
		for (var count_layer: int = 0;count_layer < prelayer1.layer.Count;++count_layer)
		{
			for (var count_object: int = 0;count_object < prelayer1.layer[count_layer].object_output.object.Count;++count_object)
			{
				if (prelayer1.layer[count_layer].object_output.object[count_object].prelayer_created)
				{
					for (var count_layer2: int = 0;count_layer2 < prelayers[prelayer1.layer[count_layer].object_output.object[count_object].prelayer_index].layer.Count;++count_layer2)
					{
						if (prelayers[prelayer1.layer[count_layer].object_output.object[count_object].prelayer_index].layer[count_layer2] == layer)
						{
							prelayer1.layer[count_layer].swap_text = prelayer1.layer[count_layer].swap_text.Replace(text1,text2);
						}
						if (prelayers[prelayer1.layer[count_layer].object_output.object[count_object].prelayer_index].layer.Count > 0)
						{
							if (swap_search_layer(prelayers[prelayer1.layer[count_layer].object_output.object[count_object].prelayer_index],prelayer2,layer,text1,text2))
							{
								prelayer1.layer[count_layer].swap_text = prelayer1.layer[count_layer].swap_text.Replace(text1,text2);
								return true;
							}
						}
					}
				}
			}
		}
	}
	return false;
}

function set_area_cube(terrain_number: int)
{
	var current_terrain: terrain_class = terrains[terrain_number];
	var scale: Vector3;
	var width: float = current_terrain.terrain.terrainData.size.x/resolution;
	var length: float = current_terrain.terrain.terrainData.size.z/resolution;
	var position: Vector3 = current_terrain.terrain.transform.position;
	
	scale.x = (current_terrain.prearea.area.xMax - current_terrain.prearea.area.x)*width;
	scale.z = (current_terrain.prearea.area.yMax - current_terrain.prearea.area.y)*length;
	scale.y = 50;
	
	position.x += (current_terrain.prearea.area.x*width)+(scale.x/2);
	position.z += (current_terrain.prearea.area.y*length)+(scale.z/2);
	position.y = transform.position.y;
	
	transform.position = position;
	transform.localScale = scale;
}

function calc_area_max(prearea: area_class)
{
	var area: Rect;
	
	area.width = terrains[0].tiles.x * terrains[0].size.x;
	area.height = terrains[0].tiles.y * terrains[0].size.z;
	
	var left_bottom_tile: int;
	
	for (var count_terrain: int = 0;count_terrain < terrains.Count;++count_terrain)
	{
		if (terrains[count_terrain].tile_z == 0 && terrains[count_terrain].tile_x == 0)
		{
			left_bottom_tile = count_terrain;
			if (!terrains[count_terrain].terrain){return;}
			break;
		}
	}
	area.x = terrains[left_bottom_tile].terrain.transform.position.x;
	area.y = terrains[left_bottom_tile].terrain.transform.position.z;
	
	prearea.area_max = area;
	prearea.round_area_to_step(prearea.area_max);
	
	correct_area_max(prearea);
}

function correct_area_max(prearea: area_class)
{
	if (prearea.area.xMin < prearea.area_max.xMin){prearea.area.xMin = prearea.area_max.xMin;}
	if (prearea.area.xMax > prearea.area_max.xMax){prearea.area.xMax = prearea.area_max.xMax;}
	if (prearea.area.yMin < prearea.area_max.yMin){prearea.area.yMin = prearea.area_max.yMin;}
	if (prearea.area.yMax > prearea.area_max.yMax){prearea.area.yMax = prearea.area_max.yMax;}
}

function set_terrain_length(length_new: int)
{	
	if (length_new != terrains.Count)
	{
		if (length_new > terrains.Count)
		{
			terrains.Add(new terrain_class());
			if (terrains.Count > 1)
			{
				terrains[terrains.Count-1].size = terrains[terrains.Count-2].size;
				terrains[terrains.Count-1].heightmap_resolution_list = terrains[terrains.Count-2].heightmap_resolution_list;
				terrains[terrains.Count-1].splatmap_resolution_list = terrains[terrains.Count-2].splatmap_resolution_list;
				terrains[terrains.Count-1].basemap_resolution_list = terrains[terrains.Count-2].basemap_resolution_list;
				terrains[terrains.Count-1].detailmap_resolution_list = terrains[terrains.Count-2].detailmap_resolution_list;
				terrains[terrains.Count-1].detail_resolution_per_patch_list = terrains[terrains.Count-2].detail_resolution_per_patch_list;
				
				set_terrain_resolution_from_list(terrains[terrains.Count-1]);
			}
			terrains[terrains.Count-1].prearea.area.xMax = resolution;
			terrains[terrains.Count-1].prearea.area.yMax = resolution;
			terrains[terrains.Count-1].index = terrains.Count-1;
		}
		else
		{
			terrains.RemoveAt(terrains.Count-1);
		}
	}
	
	if (terrains.Count == 1){terrains[0].tile_x = 0;terrains[0].tile_z = 0;terrains[0].tiles = Vector2(1,1);}
	
	calc_terrain_one_more_tile();
	set_smooth_tool_terrain_popup();
	set_terrain_text(); 
} 

function clear_terrains()
{
	terrains.Clear();
	set_terrain_length(1);
}

function set_terrain_text()
{
	if (terrains.Count > 1){terrain_text = "Terrains("+terrains.Count+")";} else {terrain_text = "Terrain("+terrains.Count+")";}
}

function add_raw_file(file: String): int
{
	var inlist: int = check_raw_file_in_list(file);
	var file_info: FileInfo = new FileInfo(file);
	
	if (file_info.Exists)
	{
		var resolution: float = Mathf.Sqrt(file_info.Length/2);
		
		if (inlist != -1)
		{
			raw_files[inlist].resolution = resolution;
			return inlist;
		}
		
		if (resolution == Mathf.Round(Mathf.Sqrt(file_info.Length/2)))
		{
			raw_files.Add(new raw_file_class());
			raw_files[raw_files.Count-1].filename = file_info.Name;
			raw_files[raw_files.Count-1].file = file;
			raw_files[raw_files.Count-1].resolution = resolution;
			raw_files[raw_files.Count-1].assigned = true;
			raw_files[raw_files.Count-1].created = true;
			return (raw_files.Count-1);
		}
		return -2;
	}
	return -1;
}

function erase_raw_file(raw_file_index: int): boolean
{
	if (raw_file_index < raw_files.Count)
	{
		raw_files[raw_file_index] = raw_files[raw_files.Count-1];
		raw_files.RemoveAt(raw_files.Count-1);
		loop_raw_file(raw_file_index,false,true,false);
		return true;
	}
	return false;
}

function check_raw_file_in_list(file: String): int
{
	for (var count_raw_file: int = 0;count_raw_file < raw_files.Count;++count_raw_file)
	{
		if (file.ToLower() == raw_files[count_raw_file].file.ToLower()){return count_raw_file;}
	}
	return -1;
}

function strip_auto_search_file(auto_search: auto_search_class)
{
	var digit: String = new String("0"[0],auto_search.digits);
	
	var format: String = auto_search.format.Replace("%x",auto_search.start_x.ToString(digit));
	format = format.Replace("%y",auto_search.start_y.ToString(digit));
	format = format.Replace("%n",auto_search.start_n.ToString(digit));
	
	auto_search.filename = Path.GetFileNameWithoutExtension(auto_search.path_full).Replace(format,String.Empty);
	auto_search.extension = Path.GetExtension(auto_search.path_full);
	
	if (auto_search.extension.Length != 0){auto_search.filename = auto_search.filename.Replace(auto_search.extension,String.Empty);}
}

function auto_search_raw(raw: raw_class)
{
	if (raw.file_index.Count < 2 || raw.file_index[0] < 0){return;}
	if (!raw_files[raw.file_index[0]].assigned){return;}
	
	var name: String = raw_files[raw.file_index[0]].filename;
	var path: String = raw_files[raw.file_index[0]].file.Replace(name,String.Empty);
	var file_index: int;
	var count_raw: int = 0;
	
	var raw_search_format: String = raw.auto_search.format;
	var format: String;
	var digit: String = new String("0"[0],raw.auto_search.digits);
	var start_y = raw.auto_search.start_y;
	var tiles: int = Mathf.Sqrt(raw.file_index.Count);
	
	for (var x: int = 0;x < tiles;++x)
	{
		for (var y: int = 0;y < tiles;++y)
		{
			format = raw_search_format.Replace("%x",(x+raw.auto_search.start_x).ToString(digit));
			format = format.Replace("%y",(y+raw.auto_search.start_y).ToString(digit));
			format = format.Replace("%n",(count_raw+raw.auto_search.start_n).ToString(digit));
			
			file_index = add_raw_file(path+raw.auto_search.filename+format+raw.auto_search.extension);
			if (file_index > -1){raw.file_index[count_raw] = file_index;}
			++count_raw;
		}
	}
	clean_raw_file_list();
}

function clean_raw_file_list()
{
	loop_raw_file(0,false,false,true);
	
	for (var count_raw_file: int = 0;count_raw_file < raw_files.Count;++count_raw_file)
	{
		if (!raw_files[count_raw_file].linked){erase_raw_file(count_raw_file);}
	}
}

function loop_raw_file(raw_file_index: int,check_double: boolean,relink: boolean,mark_linked: boolean): boolean
{
	var count_assigned: int = 0;
	var count_index: int = 0;
	
	if (mark_linked)
	{
		for (var count_raw_file: int = 0;count_raw_file < raw_files.Count;++count_raw_file)
		{
			if (!raw_files[count_raw_file].created){raw_files[count_raw_file].linked = false;}
		}
	}
	
	for (var count_terrain: int = 0;count_terrain < terrains.Count;++count_terrain)
	{
		if (terrains[count_terrain].raw_file_index > -1)
		{
			if (mark_linked){raw_files[terrains[count_terrain].raw_file_index].linked = true;}
			if (check_double)
			{
				if (terrains[count_terrain].raw_file_index == raw_file_index){++count_assigned;}
				if (count_assigned > 1){return true;}
			}
			if (relink)
			{
				if (terrains[count_terrain].raw_file_index == raw_files.Count){terrains[count_terrain].raw_file_index = raw_file_index;}
			}
		}
	}
	
	for (var count_filter: int = 0;count_filter < filter.Count;++count_filter)
	{
		for (count_index = 0;count_index < filter[count_filter].raw.file_index.Count;++count_index)
		{
			if (filter[count_filter].raw.file_index[count_index] > -1)
			{
				if (mark_linked){raw_files[filter[count_filter].raw.file_index[count_index]].linked = true;}
				if (check_double)
				{
					if (filter[count_filter].raw.file_index[count_index] == raw_file_index){++count_assigned;}	
					if (count_assigned > 1){return true;}
				}
				if (relink)
				{
					if (filter[count_filter].raw.file_index[count_index] == raw_files.Count){filter[count_filter].raw.file_index[count_index] = raw_file_index;}
				}
			}
		}
	}
	for (var count_subfilter: int = 0;count_subfilter < subfilter.Count;++count_subfilter)
	{
		for (count_index = 0;count_index < subfilter[count_subfilter].raw.file_index.Count;++count_index)
		{
			if (subfilter[count_subfilter].raw.file_index[count_index] > -1)
			{
				if (mark_linked){raw_files[subfilter[count_subfilter].raw.file_index[count_index]].linked = true;}
				if (check_double)
				{
					if (subfilter[count_subfilter].raw.file_index[count_index] == raw_file_index){++count_assigned;}
					if (count_assigned > 1){return true;}
				}
				if (relink)
				{
					if (subfilter[count_subfilter].raw.file_index[count_index] == raw_files.Count){subfilter[count_subfilter].raw.file_index[count_index] = raw_file_index;}
				}
			}
		}
	}
	return false;
}

function auto_search_heightmap(preterrain1: terrain_class)
{
	var file: String = raw_files[preterrain1.raw_file_index].file;
	var file_info: FileInfo = new FileInfo(file);
	
	var path: String = file_info.DirectoryName.Replace("\\","/");
	var name: String = file_info.Name;
	var new_name: String;
	var raw_file_index: int;
	
	for (var count_terrain: int = 0;count_terrain < terrains.Count;++count_terrain)
	{
		if (!terrains[count_terrain].terrain){continue;}
		if (!terrains[count_terrain].terrain.terrainData){continue;}
		new_name = path+"/"+terrains[count_terrain].terrain.name+".raw";
		raw_file_index = add_raw_file(new_name);
		
		if (raw_file_index > -1)
		{
			terrains[count_terrain].raw_file_index = raw_file_index;
			raw_files[raw_file_index].mode = raw_files[preterrain1.raw_file_index].mode;
			if (terrains[count_terrain].color_terrain[0] < 1.5){terrains[count_terrain].color_terrain += Color(0.5,0.5,1,0.5);}
		}
	}
	clean_raw_file_list();
}

function assign_heightmap_all_terrain()
{
	for (var count_terrain: int = 0;count_terrain < terrains.Count;++count_terrain)
	{
		if (!terrains[count_terrain].terrain){continue;}
		if (terrains[count_terrain].raw_file_index > -1)
		{
			assign_heightmap(terrains[count_terrain]);
		}
	}
}

function assign_heightmap(preterrain1: terrain_class)
{
   	var count_x: int;
	var count_y: int;        	
    var raw_file_index: int = preterrain1.raw_file_index;
    
    if (raw_file_index < 0){return;}
    
    var size: int = raw_files[raw_file_index].resolution;
    var i: int = 0;
    
    if (!preterrain1.terrain){return;}
    if (!preterrain1.terrain.terrainData){return;}
    if (!raw_files[raw_file_index].assigned){return;}
    
    if (size > preterrain1.terrain.terrainData.heightmapResolution)
    {
    	Debug.Log("The resolution of "+preterrain1.terrain.name+" is "+preterrain1.terrain.terrainData.heightmapResolution+", the Raw File resolution is "+size+". The Terrain resolution needs to be the same or higher...");
    	return;
    }
    
    preterrain1.heights = new float[size,size];
    
	raw_files[raw_file_index].bytes = File.ReadAllBytes(raw_files[raw_file_index].file);
	    	    	    	    	    	    	
    if (raw_files[raw_file_index].mode == raw_mode_enum.Mac)
    {
	   	for (count_x=0;count_x<size;++count_x) 
	   	{
			for (count_y=0;count_y<size;++count_y) 
			{
				preterrain1.heights[count_x,count_y] = (raw_files[raw_file_index].bytes[i++]*256.0+raw_files[raw_file_index].bytes[i++])/65535.0;
			}
		}
	}
			
	if (raw_files[raw_file_index].mode == raw_mode_enum.Windows)
	{
		for (count_x=0;count_x<size;++count_x) 
		{
			for (count_y=0;count_y<size;++count_y) 
			{
				preterrain1.heights[count_x,count_y] = (raw_files[raw_file_index].bytes[i++]+raw_files[raw_file_index].bytes[i++]*256.0)/65535.0;
			}
		}
	}
        	
    preterrain1.terrain.terrainData.SetHeights(0,0,preterrain1.heights);
    raw_files[raw_file_index].bytes = new byte[0];
    if (preterrain1.color_terrain[0] < 1.5){preterrain1.color_terrain += Color(0.5,0.5,1,0.5);}
}

function terrain_reset_heightmap(preterrain1: terrain_class,all: boolean)
{
	var heights: float [,] = new float[preterrain1.terrain.terrainData.heightmapResolution,preterrain1.terrain.terrainData.heightmapResolution];
	
	if (!all)
	{
		if (!preterrain1.terrain){return;}
		preterrain1.terrain.terrainData.SetHeights(0,0,heights);
		preterrain1.color_terrain = Color(0.5,0.5,1,1);
	}
	else
	{
		for (var count_terrain: int = 0;count_terrain < terrains.Count;++count_terrain)
		{
			if (!terrains[count_terrain].terrain){continue;}
			if (terrains[count_terrain].terrain.terrainData.heightmapResolution != Mathf.Sqrt(heights.Length))
			{
				heights = new float[terrains[count_terrain].terrain.terrainData.heightmapResolution,terrains[count_terrain].terrain.terrainData.heightmapResolution];
			}
			terrains[count_terrain].terrain.terrainData.SetHeights(0,0,heights);
			terrains[count_terrain].color_terrain = Color(0.5,0.5,1,1);
		}
	}
}


function terrain_reset_splat(preterrain1: terrain_class)
{
	if (!preterrain1.terrain){return;}
	if (preterrain1.splat_alpha.Length > 0){texture_fill(preterrain1.splat_alpha[0],Color(1,0,0,0),true);}
	
	if (preterrain1.splat_alpha.Length > 1)
	{
		for (var count_alpha: int = 1;count_alpha < preterrain1.splat_alpha.Length;++count_alpha)
		{
			texture_fill(preterrain1.splat_alpha[count_alpha],Color(0,0,0,0),true);
		}
	}
	preterrain1.terrain.terrainData.SetAlphamaps(0,0,preterrain1.terrain.terrainData.GetAlphamaps(0,0,1,1));
	preterrain1.color_terrain = Color(0.5,0.5,1,1);
}

function terrain_all_reset_splat()
{
	for (var count_terrain: int = 0;count_terrain < terrains.Count;++count_terrain)
	{
		terrain_reset_splat(terrains[count_terrain]);
	}
}

function texture_fill(texture: Texture2D,color: Color,apply: boolean)
{
	var width: int = texture.width;
	var height: int = texture.height;
	
	for (var y: int = 0;y < height;++y)
	{
		for (var x: int = 0;x < width;++x)
		{
			texture.SetPixel(x,y,color);
		}
	}
	
	if (apply){texture.Apply();}
}

function terrain_reset_trees(preterrain1: terrain_class,all: boolean)
{
	if (!all)
	{
		if (!preterrain1.terrain){return;}
		preterrain1.terrain.terrainData.treeInstances = new TreeInstance[0];
		preterrain1.color_terrain = Color(0.5,0.5,1,1);
	}
	else
	{
		for (var count_terrain: int = 0;count_terrain < terrains.Count;++count_terrain)
		{
			if (!terrains[count_terrain].terrain){continue;}
			terrains[count_terrain].terrain.terrainData.treeInstances = new TreeInstance[0];
			terrains[count_terrain].color_terrain = Color(0.5,0.5,1,1);
		}
	}	
}

function terrain_reset_grass(preterrain1: terrain_class,all: boolean)
{
	var detail_layer: int[,] = new int[preterrain1.terrain.terrainData.detailResolution,preterrain1.terrain.terrainData.detailResolution];
	var count_detail: int;
			        						        				
	if (!all)
	{
		if (!preterrain1.terrain){return;}
		for (count_detail = 0;count_detail < preterrain1.terrain.terrainData.detailPrototypes.Length;++count_detail)
		{
			preterrain1.terrain.terrainData.SetDetailLayer(0,0,count_detail,detail_layer);
		}
		preterrain1.color_terrain = Color(0.5,0.5,1,1);
	}
	else
	{
		for (var count_terrain: int = 0;count_terrain < terrains.Count;++count_terrain)
		{
			if (!terrains[count_terrain].terrain){continue;}
			if (terrains[count_terrain].terrain.terrainData.detailResolution != Mathf.Sqrt(detail_layer.Length))
			{
				detail_layer = new int[terrains[count_terrain].terrain.terrainData.detailResolution,terrains[count_terrain].terrain.terrainData.detailResolution];
			}
			for (count_detail = 0;count_detail < terrains[count_terrain].terrain.terrainData.detailPrototypes.Length;++count_detail)
			{
				terrains[count_terrain].terrain.terrainData.SetDetailLayer(0,0,count_detail,detail_layer);
			}
			terrains[count_terrain].color_terrain = Color(0.5,0.5,1,1);
		}
	}
}

function terrains_check_double(preterrain: terrain_class): boolean
{
	var double_terrain: boolean = false;
	for (var count1: int = 0;count1 < terrains.Count;++count1)
	{
		if (terrains[count1].terrain == preterrain.terrain && preterrain.terrain != null && terrains[count1] != preterrain){preterrain.terrain = null;double_terrain = true;}
		
	}
	return double_terrain;
}

function erase_terrain(number: int)
{
	if (terrains.Count > 1)
	{
		terrains.RemoveAt(number);		
	}
	else
	{
		terrains[number] = null;
	}  
	if (terrains.Count == 1){terrains[0].tile_x = 0;terrains[0].tile_z = 0;terrains[0].tiles = Vector2(1,1);}
	
	set_smooth_tool_terrain_popup();
	set_terrain_text();
} 

function restore_references()
{
	var transform_parent: GameObject;
	
	for (var count_terrain: int = 0;count_terrain < terrains.Count;++count_terrain)
	{
		var terrain_gameobject: GameObject;
		if (terrains[count_terrain].name != "")
		{
			terrain_gameobject = GameObject.Find(terrains[count_terrain].name);
			if (terrain_gameobject){terrains[count_terrain].terrain = terrain_gameobject.GetComponent(Terrain);}
		}
	}
	
	for (var count_prelayer: int = 0;count_prelayer < prelayers.Count;++count_prelayer)
	{
		for (var count_layer: int = 0;count_layer < prelayers[count_prelayer].layer.Count;++count_layer)
		{
			for (var count_object: int = 0;count_object < prelayers[count_prelayer].layer[count_layer].object_output.object.Count;++count_object)
			{
				var current_object: object_class = prelayers[count_prelayer].layer[count_layer].object_output.object[count_object];
				if (current_object.name != "" && !current_object.object1)
				{
					current_object.object1 = GameObject.Find(current_object.name);
				}
				if (current_object.parent_name != "" && !current_object.parent)
				{
					transform_parent = GameObject.Find(current_object.parent_name);
					if (transform_parent){current_object.parent = transform_parent.transform;}
				}
			}
		}
	}
}

function set_references()
{
	for (var count_terrain: int = 0;count_terrain < terrains.Count;++count_terrain)
	{
		if (terrains[count_terrain].terrain)
		{
			terrains[count_terrain].name = terrains[count_terrain].terrain.name;
		}
	}
	
	for (var count_prelayer: int = 0;count_prelayer < prelayers.Count;++count_prelayer)
	{
		for (var count_layer: int = 0;count_layer < prelayers[count_prelayer].layer.Count;++count_layer)
		{
			for (var count_object: int = 0;count_object < prelayers[count_prelayer].layer[count_layer].object_output.object.Count;++count_object)
			{
				var current_object: object_class = prelayers[count_prelayer].layer[count_layer].object_output.object[count_object];
				if (current_object.object1)
				{
					current_object.name = current_object.object1.name;
				}
				if (current_object.parent)
				{
					current_object.parent_name = current_object.parent.name;
				}
			}
		}
	}
}

function calc_color_pos(color: Color,color_start: Color,color_end: Color): float
{
	var color_start2: Color = color_start;
	var color_range: Color;
	if (color_start.r > color_end.r){color_start.r = color_end.r;color_end.r = color_start2.r;}
	if (color_start.g > color_end.g){color_start.g = color_end.g;color_end.g = color_start2.g;}
	if (color_start.b > color_end.b){color_start.b = color_end.b;color_end.b = color_start2.b;}
	color_range = color_end - color_start;
	color -= color_start;
	if (color.r < 0 || color.g < 0 || color.b < 0){return 0;}
	if (color.r > color_range.r || color.g > color_range.g || color.b > color_range.b){return 0;}
		
	var color_range_total: float = (color_range.r+color_range.g+color_range.b);
	var color_total: float = (color.r+color.g+color.b);
	if (color_range_total != 0){return (color_total/color_range_total);} else {return 1;}
}

function color_in_range(color: Color,color_start: Color,color_end: Color): boolean
{
	var color_start2: Color = color_start;
	
	if (color_start.r > color_end.r){color_start.r = color_end.r;color_end.r = color_start2.r;}
	if (color_start.g > color_end.g){color_start.g = color_end.g;color_end.g = color_start2.g;}
	if (color_start.b > color_end.b){color_start.b = color_end.b;color_end.b = color_start2.b;}
	if (color.r >= color_start.r && color.r <= color_end.r
			&& color.g >= color_start.g && color.g <= color_end.g
				&& color.b >= color_start.b && color.b <= color_end.b){return true;} else {return false;}
}

function random_color_from_range(color_start: Color,color_end: Color): Color
{
	var color_new: Color;
		
	var curve_r: AnimationCurve = new AnimationCurve().Linear(0,color_start.r,1,color_end.r);
	var curve_g: AnimationCurve = new AnimationCurve().Linear(0,color_start.g,1,color_end.g);
	var curve_b: AnimationCurve = new AnimationCurve().Linear(0,color_start.b,1,color_end.b);
		
	var random_range: float = UnityEngine.Random.Range(0.0,1.0);
	
	color_new.r = curve_r.Evaluate(random_range);
	color_new.g = curve_g.Evaluate(random_range);
	color_new.b = curve_b.Evaluate(random_range);
	return color_new;
}

function convert_16to8_bit(value: float)
{
	value *= 65535;
	
	var value_int: ushort = value;
	
	byte_hi = value_int >> 8;
	byte_lo = value_int-(byte_hi << 8);
}
	
function convert_24to8_bit(value: float)
{
	value *= 8388608;
	
	var value_int: uint = value;
	
	byte_hi2 = value_int >> 16;
	byte_hi = (value_int-(byte_hi2 << 16)) >> 8;
	byte_lo = value_int-(byte_hi2 << 16) - (byte_hi << 8);
	
}

function export_meshcapture(): int
{
	if (!meshcapture_tool_object){return -1;}
	
	var mesh1: MeshFilter[] = meshcapture_tool_object.GetComponentsInChildren.<MeshFilter>();
	
	var vertices: Vector3[];
	var image: Texture2D = new Texture2D(meshcapture_tool_image_width,meshcapture_tool_image_height);//,TextureFormat.ARGB32, false);
	var position: Vector3[] = new Vector3[3];
	var triangles: int[];
	var mesh: Mesh;
	var pivot: Vector3;
	var relative_position: Vector3;
	var object: Transform;
	
	image.wrapMode =  TextureWrapMode.Clamp;
	
	if (meshcapture_tool_pivot){pivot = meshcapture_tool_pivot.position;} else {pivot = meshcapture_tool_object.transform.position;}
	
	if (mesh1)
	{
		var pixels: Color[] = new Color[meshcapture_tool_image_width*meshcapture_tool_image_height];
		
		for (var pixel: Color in pixels){pixel = meshcapture_background_color;}
		
		image.SetPixels(pixels);
		
		for (var meshfilter: Component in mesh1)
		{
			mesh = meshfilter.GetComponent(MeshFilter).sharedMesh;
			if (!mesh){continue;}
			vertices = mesh.vertices;
			triangles = mesh.triangles;
			object = meshfilter.gameObject.transform;
			var normals: Vector3[] = mesh.normals;
			
			for (var counter: int = 0;counter < triangles.Length/3;++counter)
			{
				var pos: int = triangles[counter*3];
				var pos1: int = triangles[(counter*3)+1];
				var pos2: int = triangles[(counter*3)+2];
				
				position[0] = object.TransformPoint(vertices[pos])-pivot;
				position[1] = object.TransformPoint(vertices[pos1])-pivot;
				position[2] = object.TransformPoint(vertices[pos2])-pivot;
				
				var pos_v: Vector3 = position[0];
				var pos_n: Vector3 = normals[pos];
				pos_n.Normalize();
				pos_v.Normalize();
				color1 = meshcapture_tool_color;
				
				if (meshcapture_tool_shadows)
				{
					color1.r = Mathf.Abs((pos_n.x+pos_n.y+pos_n.z)/3);
					color1.g = Mathf.Abs((pos_n.x+pos_n.y+pos_n.z)/3);
					color1.b = Mathf.Abs((pos_n.x+pos_n.y+pos_n.z)/3);
					
					color1.r *= meshcapture_tool_color.r;
					color1.g *= meshcapture_tool_color.g;
					color1.b *= meshcapture_tool_color.b;
				}
				
				position[0].x *= meshcapture_tool_scale; 
				position[0].z *= meshcapture_tool_scale;
				position[0].y *= meshcapture_tool_scale;
				position[0].x += meshcapture_tool_image_width/2;
				position[0].z += meshcapture_tool_image_height/2;
				position[0].y += meshcapture_tool_image_height/2;
				
				position[1].x *= meshcapture_tool_scale;
				position[1].z *= meshcapture_tool_scale;
				position[1].y *= meshcapture_tool_scale;
				position[1].x += meshcapture_tool_image_width/2;
				position[1].z += meshcapture_tool_image_height/2;
				position[1].y += meshcapture_tool_image_height/2;
				
				position[2].x *= meshcapture_tool_scale;
				position[2].z *= meshcapture_tool_scale;
				position[2].y *= meshcapture_tool_scale;
				position[2].x += meshcapture_tool_image_width/2;
				position[2].z += meshcapture_tool_image_height/2;
				position[2].y += meshcapture_tool_image_height/2;
				
				var xx: float = 0;
				var xx2: float = 700;
				var xx3: float = 900;
				Line(image,position[0].x-xx,position[0].z,position[1].x-xx,position[1].z,color1);
				Line(image,position[0].x-xx,position[0].z,position[2].x-xx,position[2].z,color1);
				Line(image,position[1].x-xx,position[1].z,position[2].x-xx,position[2].z,color1);
			}
		}
		
		if (meshcapture_tool_save_scale)
 		{
 			var color_scale: Color = convert_float_to_color(meshcapture_tool_scale);
 			var color_temp: Color;
 			color_temp = image.GetPixel(0,0);
 			color_temp[3] = color_scale[0];
 			image.SetPixel(0,0,color_temp);
 			color_temp = image.GetPixel(1,0);
 			color_temp[3] = color_scale[1];
 			image.SetPixel(1,0,color_temp);
 			color_temp = image.GetPixel(2,0);
 		    color_temp[3] = color_scale[2];
 			image.SetPixel(2,0,color_temp);
 	    	color_temp = image.GetPixel(3,0);
 			color_temp[3] = color_scale[3];
 			image.SetPixel(3,0,color_temp);
 		}
	
		image.Apply();
		export_texture_to_file(export_path,export_file,image);
	}
	var pixels2: Color[] = new Color[2];
	image.Resize(1,1);
	image.SetPixels(pixels2);
	image.Apply();
	DestroyImmediate(image);
	
	return 1;
}

function Line (tex : Texture2D, x0 : int, y0 : int, x1 : int, y1 : int, col : Color) 
{
	var dy = y1-y0;
	var dx = x1-x0;
 
	if (dy < 0) {dy = -dy;var stepy = -1;}
	else {stepy = 1;}
	if (dx < 0) {dx = -dx;var stepx = -1;}
	else {stepx = 1;}
	dy <<= 1;
	dx <<= 1;
 
	tex.SetPixel(x0, y0, col);
	if (dx > dy) 
	{
		var fraction = dy-(dx >> 1);
		while (x0 != x1) 
		{
			if (fraction >= 0) 
			{
				y0 += stepy;
				fraction -= dx;
			}
			x0 += stepx;
			fraction += dy;
			tex.SetPixel(x0,y0,col);
		}
	}
	else 
	{
		fraction = dx - (dy >> 1);
		while (y0 != y1) {
			if (fraction >= 0) 
			{
				x0 += stepx;
				fraction -= dy;
			}
			y0 += stepy;
			fraction += dx;
			tex.SetPixel(x0,y0,col);
		}
	}
}

function texture_fill_color(texture1: Texture2D,color: Color)
{
	var resolution: float = texture1.width*texture1.height;
	var fillcolor: Color[] = new Color[resolution];
	
	for (color1 in fillcolor){color1 = color;}
	
	texture1.SetPixels(0,0,texture1.width,texture1.height,fillcolor);
}

function tree_placed_reset()
{
	for (var count_layer: int = 0;count_layer < prelayer.layer.Count;++count_layer)
	{
		if (prelayer.layer[count_layer].output == layer_output_enum.tree)
		{
			for (var count_tree: int = 0;count_tree < prelayer.layer[count_layer].tree_output.tree.Count;++count_tree)
			{
				prelayer.layer[count_layer].tree_output.tree[count_tree].placed = 0;
			}
		}
	}
}

// generate_begin
function generate_begin(): int
{
	if (heightmap_output)
	{
		if (!color_output && !splat_output && !tree_output && !grass_output && !object_output){only_heightmap = true;}
	}
	
	prelayer = prelayers[0];
	
	UnityEngine.Random.seed = 10;
	
	if (settings.resolution_density){settings.resolution_density_conversion = (1.0/(settings.resolution_density_min*1.0));}
	
	if (slice_tool_active && !slice_tool_terrain){return -6;}
	prelayer.count_terrain = 0;
	
	generate_world_mode = prelayers[0].prearea.active;
	var count_terrain2: int = 0;
	
	for (var count_terrain: int = 0;count_terrain < terrains.Count;++count_terrain)
	{
		terrains[count_terrain].index = count_terrain;
		terrains[count_terrain].index_old = count_terrain2;
		++count_terrain2;
		if(!terrains[count_terrain].terrain){terrains.RemoveAt(count_terrain);--count_terrain;continue;} 
		if(!terrains[count_terrain].terrain.terrainData){terrains.RemoveAt(count_terrain);--count_terrain;}
	}

	if (!find_terrain()){return -1;}
	
	get_terrains_position();
	preterrain = terrains[prelayer.count_terrain];
    
	for (count_terrain = 0;count_terrain < terrains.Count;++count_terrain)
    {
    	if (terrains[count_terrain].prearea.resolution_mode == resolution_mode_enum.Automatic){select_automatic_step_resolution(terrains[count_terrain],terrains[count_terrain].prearea);}
    	set_area_resolution(terrains[count_terrain],terrains[count_terrain].prearea);
    	terrains[count_terrain].prearea.round_area_to_step(terrains[count_terrain].prearea.area);
    	terrains[count_terrain].prearea.area_old = terrains[count_terrain].prearea.area;
    	terrains[count_terrain].prearea.area.x += terrains[count_terrain].terrain.transform.position.x;
    	terrains[count_terrain].prearea.area.y += terrains[count_terrain].terrain.transform.position.z;
    	terrains[count_terrain].prearea.area.xMax += terrains[count_terrain].prearea.step.x/2;
    	terrains[count_terrain].prearea.area.yMin -= terrains[count_terrain].prearea.step.y/2;
    	
		if (terrains[count_terrain].tree_instances.Count > 0){terrains[count_terrain].tree_instances.Clear();}
		
		if (heightmap_output)
		{
			terrains[count_terrain].heights = new float[terrains[count_terrain].terrain.terrainData.heightmapResolution,terrains[count_terrain].terrain.terrainData.heightmapResolution];
			// script_base.terrains[count_terrain].heights = terrains[count_terrain].heights;
		}
		
		if (color_output)
		{
			terrains[count_terrain].splat_length = terrains[count_terrain].terrain.terrainData.splatPrototypes.Length;
			if (terrains[count_terrain].splat_length < 3)
			{
				set_terrain_splat_textures(terrains[count_terrain],terrains[count_terrain]);
				check_synchronous_terrain_splat_textures(terrains[count_terrain]);
				// preterrain = terrains[count_terrain];return -4;
			}
			terrains[count_terrain].splat = new float[terrains[count_terrain].splat_length];
			terrains[count_terrain].splat_layer = new float[Mathf.Ceil(terrains[count_terrain].splat_length/4.0)*4.0];
		}
		else if (splat_output)
		{
			terrains[count_terrain].splat_length = terrains[count_terrain].terrain.terrainData.splatPrototypes.Length;
			if (terrains[count_terrain].splat_length == 0 && (color_output || splat_output)){preterrain = terrains[count_terrain];return -3;}
			if (terrains[count_terrain].splat_length == 1 && splat_output){preterrain = terrains[count_terrain];return -5;}
			if (terrains[count_terrain].splat_length < terrains[0].splat_length){preterrain = terrains[count_terrain];return -7;}
				
			terrains[count_terrain].splat = new float[terrains[count_terrain].splat_length];
			terrains[count_terrain].splat_layer = new float[Mathf.Ceil(terrains[count_terrain].splat_length/4.0)*4.0];
		}
		
		if (grass_output)
		{
			terrains[count_terrain].grass_detail = new detail_class[preterrain.terrain.terrainData.detailPrototypes.Length];
			if (terrains[count_terrain].terrain.terrainData.detailPrototypes.Length < terrains[0].terrain.terrainData.detailPrototypes.Length){preterrain = terrains[count_terrain];return -8;}
			for (var count_detail: int = 0;count_detail < terrains[count_terrain].grass_detail.Length;++count_detail)
			{
				terrains[count_terrain].grass_detail[count_detail] = new detail_class();
				terrains[count_terrain].grass_detail[count_detail].detail = new int[preterrain.detail_resolution,preterrain.detail_resolution];
    		}
    		terrains[count_terrain].grass = new float[terrains[count_terrain].terrain.terrainData.detailPrototypes.Length];
		}
    }
    
    if (terrains.Count == 0){return -2;}
	generate_pause = false;
	prelayer_stack.Add(0);
	
	// reset placement counters
	link_placed_reference();
	loop_prelayer("(gfc)(slv)(ocr)(asr)(cpo)(ias)(eho)(st)(cmn)(lrf)(ed)",0,false);
	
	if (generate_world_mode)
	{
		// prelayer.prearea.area.yMin -= (prelayer.prearea.step.y/2);
    	// prelayer.prearea.area.yMax += (prelayer.prearea.step.y/2);
    	// prelayer.prearea.area.xMin -= (prelayer.prearea.step.x/2);
    	// prelayer.prearea.area.xMax += (prelayer.prearea.step.x/2); 
    }
	
	if (!heightmap_output_layer){heightmap_output = false;}
	if (prelayer.layer.Count == 0){return -2;}
	
	if (prelayers.Count > 1){area_stack_enabled = true;}
	
	generate_time_start = Time.realtimeSinceStartup;
	generate_time = 0;
	
	tree_number = 0;
	
	generate_terrain_start();
	
	return 1;
}

function select_automatic_step_resolution(preterrain1: terrain_class,prearea: area_class)
{
	var resolution: int = 0;
	
	if (preterrain1.terrain.terrainData.heightmapResolution > resolution && heightmap_output){resolution = preterrain1.terrain.terrainData.heightmapResolution;prearea.resolution_mode = resolution_mode_enum.Heightmap;}
	if (preterrain1.terrain.terrainData.alphamapResolution > resolution && (color_output || splat_output)){resolution = preterrain1.terrain.terrainData.alphamapResolution;prearea.resolution_mode = resolution_mode_enum.Splatmap;}
	if (preterrain1.terrain.terrainData.detailResolution > resolution && grass_output){resolution = preterrain1.terrain.terrainData.detailResolution;prearea.resolution_mode = resolution_mode_enum.Detailmap;}
	if (prearea.tree_resolution > resolution && tree_output && prearea.tree_resolution_active){resolution = prearea.tree_resolution;prearea.resolution_mode = resolution_mode_enum.Tree;}
	if (prearea.object_resolution > resolution && object_output && prearea.object_resolution_active){resolution = prearea.object_resolution;prearea.resolution_mode = resolution_mode_enum.Object;}
	
	if (resolution == 0){resolution = resolution_mode_enum.Detailmap;prearea.resolution_mode = resolution_mode_enum.Detailmap;}
}

// generate_terrain_start
function generate_terrain_start()
{
	if (!generate_world_mode)
	{
		prelayer.prearea = preterrain.prearea;
		for (var count_terrain: int = 0;count_terrain < terrains.Count;++count_terrain)
	 	{
	 		terrains[count_terrain].on_row = false;
	 	}
	 	preterrain.on_row = true;
	}
		
	prelayer.y = prelayer.prearea.area.yMax;
	
	select_image_prelayer();
	
	if (button_export)
	{
		if (heightmap_output){export_bytes = new byte[Mathf.Pow(preterrain.terrain.terrainData.heightmapResolution,2)*2];}
		if (!export_texture){export_texture = new Texture2D(1,1);}
		export_texture.Resize(preterrain.prearea.resolution,preterrain.prearea.resolution,TextureFormat.RGB24, false);
		texture_fill_color(export_texture,Color.black);
		export_texture.Apply();
	}
}

// generate_output
function generate_output(prelayer3: prelayer_class): int
{
 	for(prelayer3.counter_y = prelayer3.y;prelayer3.counter_y >= prelayer3.y-(generate_step*prelayer.prearea.step.y);prelayer3.counter_y -= prelayer.prearea.step.y)
 	{
 		generate_call_time = Time.realtimeSinceStartup;
 		var y: float = prelayer3.y;
 		var count_terrain: int;
 			
 		if (prelayer3.counter_y < prelayer3.prearea.area.yMin)
	 	{
	 		if (prelayer_stack.Count > 1)
	 		{
	 			if (line_output){line_generate(prelayer3.index);}
	 			prelayer_stack.RemoveAt(prelayer_stack.Count-1);
	 			// area_stack.Add(prelayer.prearea.area);
	 			prelayer = prelayers[prelayer_stack[prelayer_stack.Count-1]];
	 			return;
	 		}
	 		if (generate_world_mode)
	 		{
	 			generate = false;
	 			for (count_terrain = 0;count_terrain < terrains.Count;++count_terrain)
		 		{
		 			terrain_apply(terrains[count_terrain]); 	
		 		}
	 		}
	 		else
	 		{
	 			if (prelayer3.count_terrain >= terrains.Count-1){generate = false;} 
	 			terrain_apply(terrains[prelayer3.count_terrain]);
	 		}
	 		
	 		if (button_export)
	 		{
	 			export_texture.Apply();
	 			export_name = export_file;
	 			if (terrains.Count > 1){export_name += "_"+prelayer.count_terrain;}
				
				export_texture_to_file(export_path,export_name,export_texture);
				
				if (settings.colormap)
				{
					if (settings.colormap_auto_assign || settings.normalmap_auto_assign){script_base.preterrain = script_base.terrains[prelayer3.count_terrain];}
				}
												
	 			export_texture.Resize(0,0);
				export_texture.Apply();
	 		}
	 		generate_time = Time.realtimeSinceStartup - generate_time_start;
	 		
	 		if (generate)
	 		{
	 			++prelayer3.count_terrain;
	 			if (find_terrain())
	 			{
	 				preterrain = terrains[prelayer3.count_terrain];
	 				generate_terrain_start();
	 			}
	 			else {generate = false;}
	 		} 
	 		else {set_neighbor(1);}
	 		if (!generate && line_output){line_generate(0);}
	 		return 2;
 		}	
 		
 		if (generate_world_mode || prelayer3.index > 0)
 		{
	 		for (count_terrain = 0;count_terrain < terrains.Count;++count_terrain)
	 		{
	 			if (terrains[count_terrain].rect.Contains(Vector2(terrains[count_terrain].prearea.area.x,y))){terrains[count_terrain].on_row = true;} else {terrains[count_terrain].on_row = false;}
	 		}
	 	}
 	    
 		for (prelayer3.x = prelayer3.prearea.area.x+prelayer3.break_x_value;prelayer3.x <= prelayer3.prearea.area.xMax;prelayer3.x += prelayer3.prearea.step.x)
 		{
 			if (generate_error){generate = false;return;}
 			var x: float = prelayer3.x;
 			var curve: float;
			var strength: float;
			var strength2: float;
			var counter_y: float = prelayer3.counter_y;
			var out_of_range: boolean = false;
			
			if (generate_world_mode || prelayer3.index > 0)
			{
				out_of_range = true;
				for (count_terrain = 0;count_terrain < terrains.Count;++count_terrain)
				{
					if (terrains[count_terrain].rect.Contains(Vector2(x,counter_y)))
					{
						out_of_range = false;
						preterrain = terrains[count_terrain];
						break;
					}
				}
 			}
 			
 			if (out_of_range){continue;}
 			
 			local_x = x-preterrain.rect.x;
			local_y = counter_y-preterrain.rect.y;	
 			
			if (prelayer3.prearea.rotation_active)
			{
				var rotation_pos: Vector2 = calc_rotation_pixel(x,counter_y,prelayer3.prearea.center.x,prelayer3.prearea.center.y,prelayer3.prearea.rotation.y);
				x = rotation_pos.x;
				counter_y = rotation_pos.y;
			}
			
			local_x_rot = x-preterrain.rect.x;
			local_y_rot = counter_y-preterrain.rect.y;	
	 		
			if (!slice_tool_active)
 			{
	 			if (!only_heightmap)
	 			{
	 				degree = calc_terrain_angle(preterrain,local_x_rot,local_y_rot,settings.smooth_angle);
	 				height = preterrain.terrain.terrainData.GetHeight(local_x_rot/preterrain.heightmap_conversion.x,local_y_rot/preterrain.heightmap_conversion.y)/preterrain.size.y;
	 			}
	 			if (measure_normal){normal = preterrain.terrain.terrainData.GetInterpolatedNormal((local_x_rot/preterrain.size.x),(local_y_rot/preterrain.size.z));}
			}
			else
			{
				if (slice_tool_rect.Contains(Vector2(((x-slice_tool_offset.x)),((counter_y-slice_tool_offset.y)))))
				{
					height = slice_tool_terrain.terrainData.GetInterpolatedHeight(((x-slice_tool_terrain.transform.position.x-slice_tool_offset.x)/slice_tool_terrain.terrainData.size.x),((counter_y-slice_tool_terrain.transform.position.z-slice_tool_offset.y)/slice_tool_terrain.terrainData.size.z))/slice_tool_terrain.terrainData.size.y;
				}
				else {height = slice_tool_min_height;}
			}
			random_range = UnityEngine.Random.Range(0.00,1000.00);
			
			// color-splat output
			if (color_output || splat_output)
			{
				map_x = Mathf.Round(local_x_rot/preterrain.splatmap_conversion.x);
				map_y = Mathf.Round(local_y_rot/preterrain.splatmap_conversion.y);
				if (map_y > preterrain.splatmap_resolution-1){map_y = preterrain.splatmap_resolution-1;}
				else if (map_y < 0){map_y = 0;}
				if (map_x > preterrain.splatmap_resolution-1){map_x = preterrain.splatmap_resolution-1;}
				else if (map_x < 0){map_x = 0;}
			}
			
			// grass_output
			if (grass_output)
			{
				detailmap_x = Mathf.Round(local_x_rot/preterrain.detailmap_conversion.x);
				detailmap_y = Mathf.Round(local_y_rot/preterrain.detailmap_conversion.y);
				
				if (detailmap_x > preterrain.detail_resolution-1){detailmap_x = preterrain.detail_resolution-1;}
				else if (detailmap_x < 0){detailmap_x = 0;}
				if (detailmap_y > preterrain.detail_resolution-1){detailmap_y = preterrain.detail_resolution-1;}
				else if (detailmap_y < 0){detailmap_y = 0;}
			}
			
			// heightmap output
			if (heightmap_output)
			{
				heightmap_x = Mathf.Round(local_x_rot/preterrain.heightmap_conversion.x); 
				heightmap_y = Mathf.Round(local_y_rot/preterrain.heightmap_conversion.y);
				
				if (heightmap_x_old == heightmap_x && heightmap_y_old == heightmap_y){Debug.Log("Hit");}
				
				heightmap_x_old = heightmap_x;
				heightmap_y_old = heightmap_y;
				
				if (heightmap_y > preterrain.heightmap_resolution-1){heightmap_y = preterrain.heightmap_resolution-1;}
				else if (heightmap_y < 0){heightmap_y = 0;}
				if (heightmap_x > preterrain.heightmap_resolution-1){heightmap_x = preterrain.heightmap_resolution-1;}
				else if (heightmap_x < 0){heightmap_x = 0;}
			}
			
			// process all layers
			for (var count_layer: int = 0;count_layer < prelayer3.layer.Count;++count_layer)
			{
				current_layer = prelayer3.layer[count_layer];
				
	        	filter_value = 0;
	        	filter_strength = 1;
	        	
				// process all filters
				if (current_layer.output == layer_output_enum.heightmap)
				{
					layer_x = heightmap_x*preterrain.heightmap_conversion.x;
					layer_y = heightmap_y*preterrain.heightmap_conversion.y;
				}
				else if (current_layer.output == layer_output_enum.color || current_layer.output == layer_output_enum.splat)
				{
					layer_x = map_x*preterrain.splatmap_conversion.x;
					layer_y = map_y*preterrain.splatmap_conversion.y;
				}
				else if (current_layer.output == layer_output_enum.grass)
				{
					layer_x = detailmap_x*preterrain.detailmap_conversion.x;
					layer_y = detailmap_y*preterrain.detailmap_conversion.y;
				}
				else {layer_x = local_x_rot;layer_y = local_y_rot;}
				
				for (var count_filter: int = 0;count_filter < current_layer.prefilter.filter_index.Count;++count_filter)
				{
					calc_filter_value(filter[current_layer.prefilter.filter_index[count_filter]],counter_y,x);
				}
				
				// tree generate
				switch(current_layer.output)
				{
					// tree
					case layer_output_enum.tree:
						if (subfilter_value*current_layer.strength > 0)
						{
							if (local_x_rot < prelayer3.prearea.step.x){continue;}
							if (local_y_rot > preterrain.size.z-prelayer3.prearea.step.y){continue;}
							if (current_layer.tree_output.tree.Count == 0){continue;}
							var tempInstance: TreeInstance;
							var tree_filter_strength: float = 0;
							var tree_filter_curve: float;
							var tree_filter_random_curve: float;
							var place: boolean = true;
							var tree_index: int = Mathf.FloorToInt(current_layer.tree_output.tree_value.curve.Evaluate(filter_value)*(current_layer.tree_output.tree.Count));
							if (tree_index > current_layer.tree_output.tree.Count-1){tree_index = current_layer.tree_output.tree.Count-1;}
							if (tree_index < 0){tree_index = 0;}
							
							var current_tree3: tree_class = current_layer.tree_output.tree[tree_index];
							tempInstance.prototypeIndex = current_tree3.prototypeindex;
							
							random_range2 = UnityEngine.Random.value;
							if (settings.resolution_density)
							{
								if (random_range2 > ((subfilter_value*current_layer.strength*filter_strength)/((prelayer3.prearea.resolution*settings.resolution_density_conversion)*(prelayer3.prearea.resolution*settings.resolution_density_conversion)))){continue;}
							}
							else
							{
								if (random_range2 > ((subfilter_value*current_layer.strength*filter_strength))){continue;}
							}
							filter_value = 0;
							for (var count_tree_filter: int = 0;count_tree_filter < current_tree3.prefilter.filter_index.Count;++count_tree_filter)
							{
								calc_filter_value(filter[current_tree3.prefilter.filter_index[count_tree_filter]],counter_y,x);
							}	
							
							var tree_height_range: float = current_tree3.height_end-current_tree3.height_start;
							
							var tree_height_pos: float = (tree_height_range*filter_value);
							var tree_height: float = tree_height_pos+current_tree3.height_start;
							
							var tree_height_pos_ratio: float = tree_height_pos/tree_height_range;
							
							var tree_width_range: float = current_tree3.width_end-current_tree3.width_start;
							
							var tree_width_start_n: float = ((tree_width_range*tree_height_pos_ratio)-(current_tree3.unlink*tree_height_pos))+current_tree3.width_start;
							if (tree_width_start_n < current_tree3.width_start){tree_width_start_n = current_tree3.width_start;}
							var tree_width_end_n: float = ((tree_width_range*tree_height_pos_ratio)+(current_tree3.unlink*tree_height_pos))+current_tree3.width_start;
							if (tree_width_end_n > current_tree3.width_end){tree_width_end_n = current_tree3.width_end;}
							
							var tree_width: float = UnityEngine.Random.Range(tree_width_start_n,tree_width_end_n);
							
							scale = Vector3(tree_width,tree_height,tree_width);
							var random_pos_x: float = 0;
							var random_pos_z: float = 0; 
							
							if (current_tree3.random_position)
							{	
								random_pos_x = UnityEngine.Random.Range(-prelayer3.prearea.step.x/2,prelayer.prearea.step.x/2);
								random_pos_z = UnityEngine.Random.Range(-prelayer3.prearea.step.y/2,prelayer.prearea.step.y/2);
							}
							
							var height2: float = preterrain.terrain.terrainData.GetInterpolatedHeight((local_x_rot+random_pos_x)/preterrain.size.x,(local_y_rot+random_pos_z)/preterrain.size.z);
							
							position = Vector3(local_x_rot+random_pos_x,height2,local_y_rot+random_pos_z);
							
							if (current_tree3.distance_level != distance_level_enum.This || (current_tree3.min_distance.x != 0 || current_tree3.min_distance.z != 0 || current_tree3.min_distance.y != 0))
							{
								object_info.position = position;
								object_info.min_distance = current_tree3.min_distance;
								if (current_tree3.distance_include_scale){object_info.min_distance = Vector3(object_info.min_distance.x*scale.x,object_info.min_distance.y*scale.y,object_info.min_distance.z*scale.z);}
								if (current_tree3.distance_include_scale_group){object_info.min_distance = object_info.min_distance*current_layer.tree_output.scale;}
								
								object_info.distance_rotation = current_tree3.distance_rotation_mode;
								object_info.distance_mode = current_tree3.distance_mode;
								
								switch(current_tree3.distance_level)
								{
									case distance_level_enum.This:
										place = check_object_distance(current_tree3.objects_placed);
										break;
										
									case distance_level_enum.Layer:
										place = check_object_distance(current_layer.objects_placed);
										break;
									
									case distance_level_enum.LayerLevel:
										place = check_object_distance(prelayer3.objects_placed);
										break;
										
									case distance_level_enum.Global:
										place = check_object_distance(objects_placed);
										break;
								}	
							}
															
							if (place)
							{																																																																								
								tempInstance.position = Vector3(position.x/preterrain.size.x,position.y/preterrain.size.y,position.z/preterrain.size.z);
								if (current_tree3.precolor_range.color_range.Count != 0)
								{
									var color_range_number: int = Mathf.FloorToInt(current_tree3.precolor_range.color_range_value.curve.Evaluate(subfilter_value)*current_tree3.precolor_range.color_range.Count);
									if (color_range_number > current_tree3.precolor_range.color_range.Count-1){color_range_number = current_tree3.precolor_range.color_range.Count-1;}
									var color_range: color_range_class = current_tree3.precolor_range.color_range[color_range_number];
									tree_color = random_color_from_range(color_range.color_start,color_range.color_end);
								}
												
								tempInstance.color = tree_color;
								
								tempInstance.lightmapColor = tree_color;
								tempInstance.heightScale = scale.y*current_layer.tree_output.scale;
								tempInstance.widthScale = scale.x*current_layer.tree_output.scale;
								
								preterrain.tree_instances.Add(tempInstance);
								++current_tree3.placed;
								++prelayer.layer[count_layer].tree_output.placed;
							}
						}
						break;
					
					// grass generate
					case layer_output_enum.grass:
						if (subfilter_value*current_layer.strength > 0)
						{
							var count_grass: int;
							if (settings.resolution_density)
							{
								for (count_grass = 0;count_grass < preterrain.grass.Length;++count_grass)
								{
									preterrain.grass_detail[count_grass].detail[detailmap_y,detailmap_x] += (preterrain.grass[count_grass]*settings.grass_density)/((prelayer3.prearea.resolution*settings.resolution_density_conversion)*(prelayer3.prearea.resolution*settings.resolution_density_conversion));
								}
							}
							else
							{
								for (count_grass = 0;count_grass < preterrain.grass.Length;++count_grass)
								{
									preterrain.grass_detail[count_grass].detail[detailmap_y,detailmap_x] += preterrain.grass[count_grass]*settings.grass_density;
								}
							}
							
						}
						for (count_value = 0;count_value < preterrain.grass.Length;++count_value)
						{
							preterrain.grass[count_value] = 0;
						}
						break;
					
					// object generate
					case layer_output_enum.object:
						if (subfilter_value*current_layer.strength*filter_strength > 0)
						{
							if (local_x_rot < prelayer3.prearea.step.x){continue;}
							if (local_y_rot > preterrain.size.z-prelayer3.prearea.step.y){continue;}

							if (current_layer.object_output.object.Count == 0){continue;}
							
							if (current_layer.object_output.object_mode == object_mode_enum.LinePlacement)
							{
								var pixel_color: Color = calc_image_value(current_layer.object_output.line_placement.preimage,local_x_rot,local_y_rot);
								if (pixel_color[0] == current_layer.object_output.line_placement.line_list[0].color[0])
								{
									if (current_layer.object_output.placed_reference)
									{
										height_interpolated = preterrain.terrain.terrainData.GetInterpolatedHeight((local_x_rot)/preterrain.size.x,(local_y_rot)/preterrain.size.z);
										current_layer.object_output.placed_reference.line_placement.line_list[0].points[(pixel_color[2]*255)] = new Vector3(x,height_interpolated,counter_y);
									}
								}
								continue;
							}
							
							var object_index: int = Mathf.FloorToInt(current_layer.object_output.object_value.curve.Evaluate(filter_value)*(current_layer.object_output.object.Count));
							if (object_index > current_layer.object_output.object.Count-1){object_index = current_layer.object_output.object.Count-1;}
							if (object_index < 0){object_index = 0;}
							var current_object: object_class = current_layer.object_output.object[object_index];
							if (current_object.place_maximum){if (current_object.placed_prelayer >= current_object.place_max){continue;}}
							if (!current_object.object1){continue;}
														
							random_range2 = UnityEngine.Random.Range(0.0,1.0);
							if (settings.resolution_density)
							{
								if (random_range2 > ((subfilter_value*current_layer.strength*filter_strength)/((prelayer3.prearea.resolution*settings.resolution_density_conversion)*(prelayer3.prearea.resolution*settings.resolution_density_conversion)))){continue;}
							}
							else
							{
								if (random_range2 > ((subfilter_value*current_layer.strength*filter_strength))){continue;}
							}
							place = true;
							
							var clear_list: boolean = true;
							var rotation: Vector3;
							var count_object: int;
							
							position = Vector3(x,0,counter_y);
							var position_random: Vector3;
							var position_start: Vector3 = current_object.position_start;
							var position_end: Vector3 = current_object.position_end;
							
							position_random.x = UnityEngine.Random.Range(position_start.x,position_end.x);
							position_random.y = UnityEngine.Random.Range(position_start.y,position_end.y);
							position_random.z = UnityEngine.Random.Range(position_start.z,position_end.z);
							
							if (current_object.random_position)
							{
								position_random.x += UnityEngine.Random.Range(-prelayer3.prearea.step.x/2,prelayer.prearea.step.x/2);
								position_random.z += UnityEngine.Random.Range(-prelayer3.prearea.step.y/2,prelayer.prearea.step.y/2);
							}
								
							position += position_random;
							
							if (current_object.terrain_rotate)
							{
								var rotation1: Vector3 = preterrain.terrain.terrainData.GetInterpolatedNormal(((local_x_rot+position_random.x)/preterrain.size.x),((local_y_rot+position_random.y)/preterrain.size.z));
								rotation1.x = (rotation1.x/3)*2;
								rotation1.z = (rotation1.z/3)*2;
								
								rotation = Quaternion.LookRotation(rotation1).eulerAngles;
								rotation.x += 90;
							}
				
							if (!current_object.rotation_map.active && !current_layer.object_output.rotation_map.active)
							{
								rotation.x += UnityEngine.Random.Range(current_object.rotation_start.x,current_object.rotation_end.x);
								rotation.y += UnityEngine.Random.Range(current_object.rotation_start.y,current_object.rotation_end.y);
								rotation.z += UnityEngine.Random.Range(current_object.rotation_start.z,current_object.rotation_end.z);
								
								rotation += current_object.parent_rotation;
							}
							else
							{
								var color_rot: Color;
								if (current_layer.object_output.rotation_map.active)
								{
									color_rot = calc_image_value(current_layer.object_output.rotation_map.preimage,local_x,local_y);
									rotation.y = current_layer.object_output.rotation_map.calc_rotation(color_rot);
								}
								else 
								{
									color_rot = calc_image_value(current_object.rotation_map.preimage,local_x,local_y);
									rotation.y = current_object.rotation_map.calc_rotation(color_rot);
								}
							}
							if (current_object.look_at_parent)
							{
								rotation.y = Quaternion.LookRotation(Vector3(prelayer3.prearea.area.center.x,0,prelayer3.prearea.area.center.y)-position).eulerAngles.y;
							}
									
							if (current_object.rotation_steps)
							{
								if (current_object.rotation_step.x != 0){rotation.x = Mathf.Round(rotation.x/current_object.rotation_step.x)*current_object.rotation_step.x;}
								if (current_object.rotation_step.y != 0){rotation.y = Mathf.Round(rotation.y/current_object.rotation_step.y)*current_object.rotation_step.y;}
								if (current_object.rotation_step.z != 0){rotation.z = Mathf.Round(rotation.z/current_object.rotation_step.z)*current_object.rotation_step.z;}
							}	
									
							if (current_layer.object_output.group_rotation)
							{
								var object_index_rot: int = check_object_rotate(current_layer.object_output.objects_placed,current_layer.object_output.objects_placed_rot,position,current_layer.object_output.min_distance_x_rot,current_layer.object_output.min_distance_z_rot);
									
								if (object_index_rot != -1)
								{
									rotation = current_layer.object_output.objects_placed_rot[object_index_rot];
									
									if (current_layer.object_output.group_rotation_steps)
									{
										if (current_layer.object_output.group_rotation_step.x != 0){rotation.x += Mathf.Round(UnityEngine.Random.Range(0,360/current_layer.object_output.group_rotation_step.x))*current_layer.object_output.group_rotation_step.x;}
										if (current_layer.object_output.group_rotation_step.y != 0){rotation.y += Mathf.Round(UnityEngine.Random.Range(0,360/current_layer.object_output.group_rotation_step.y))*current_layer.object_output.group_rotation_step.y;}
										if (current_layer.object_output.group_rotation_step.z != 0){rotation.z += Mathf.Round(UnityEngine.Random.Range(0,360/current_layer.object_output.group_rotation_step.z))*current_layer.object_output.group_rotation_step.z;}
									}
								}
							}	
							
							if (current_object.terrain_height)
							{
								height_interpolated = preterrain.terrain.terrainData.GetInterpolatedHeight((local_x_rot+position_random.x)/preterrain.size.x,(local_y_rot+position_random.z)/preterrain.size.z);
							
								position.y = (height_interpolated)+preterrain.terrain.transform.position.y+position_random.y;
							}
							
							scale.x = UnityEngine.Random.Range(current_object.scale_start.x,current_object.scale_end.x);
							
							var scale_x_range: float = current_object.scale_end.x-current_object.scale_start.x;
							var scale_x_pos: float = scale.x-current_object.scale_start.x;
							var scale_x_pos_ratio: float = scale_x_pos/scale_x_range;
							
							var scale_y_range: float = current_object.scale_end.y-current_object.scale_start.y;
							var scale_y_start_n: float = ((scale_y_range*scale_x_pos_ratio)-(current_object.unlink_y*scale_x_pos))+current_object.scale_start.y;
							if (scale_y_start_n < current_object.scale_start.y){scale_y_start_n = current_object.scale_start.y;}
							var scale_y_end_n: float = ((scale_y_range*scale_x_pos_ratio)+(current_object.unlink_y*scale_x_pos))+current_object.scale_start.y;
							if (scale_y_end_n > current_object.scale_end.y){scale_y_end_n = current_object.scale_end.y;}
							
							scale.y = UnityEngine.Random.Range(scale_y_start_n,scale_y_end_n);
							
							var scale_z_range: float = current_object.scale_end.z-current_object.scale_start.z;
							var scale_z_start_n: float = ((scale_z_range*scale_x_pos_ratio)-(current_object.unlink_z*scale_x_pos))+current_object.scale_start.z;
							if (scale_z_start_n < current_object.scale_start.z){scale_z_start_n = current_object.scale_start.z;}
							var scale_z_end_n: float = ((scale_z_range*scale_x_pos_ratio)+(current_object.unlink_z*scale_x_pos))+current_object.scale_start.z;
							if (scale_z_end_n > current_object.scale_end.z){scale_z_end_n = current_object.scale_end.z;}
							
							scale.z = UnityEngine.Random.Range(scale_z_start_n,scale_z_end_n);
							
							if (current_object.distance_level != distance_level_enum.This || (current_object.min_distance.x != 0 || current_object.min_distance.z != 0 || current_object.min_distance.y != 0))
							{
								object_info.position = position;
								object_info.rotation = rotation;
								object_info.min_distance = current_object.min_distance;
								if (current_object.distance_include_scale){object_info.min_distance = Vector3(object_info.min_distance.x*scale.x,object_info.min_distance.y*scale.y,object_info.min_distance.z*scale.z);}
								if (current_object.distance_include_scale_group){object_info.min_distance = object_info.min_distance*current_layer.object_output.scale;}
								
								object_info.distance_rotation = current_object.distance_rotation_mode;
								object_info.distance_mode = current_object.distance_mode;
								
								switch(current_object.distance_level)
								{
									case distance_level_enum.This:
										place = check_object_distance(current_object.objects_placed);
										break;
										
									case distance_level_enum.Layer:
										place = check_object_distance(current_layer.objects_placed);
										break;
									
									case distance_level_enum.LayerLevel:
										place = check_object_distance(prelayer3.objects_placed);
										break;
										
									case distance_level_enum.Global:
										place = check_object_distance(objects_placed);
										break;
								}	
								
							}
							
							scale *= current_layer.object_output.scale;	
							
							if (place)
							{
								var resolution1: float = preterrain.size.z; 
								resolution1 = resolution1 / preterrain.heightmap_resolution;
								
								var object1: GameObject;
								object1 = Instantiate(current_object.object1,position,Quaternion.Euler(rotation));
								object1.transform.localScale = scale;
								
								var material_index: int = 0;
								if (current_object.object_material.active){material_index = current_object.object_material.set_material(object1,0);}
								
								// combine children
								if (current_object.mesh_combine)
								{
									if (current_object.object_material.combine_count[material_index] >= current_object.mesh_combine || (!current_object.combine_total && current_object.placed_prelayer == 0)){current_object.object_material.combine_count[material_index] = 0;}
									 									
									if (current_object.object_material.combine_count[material_index] == 0)
									{
										var mat_text: String;
										if (current_object.object_material.material.Count > 1){mat_text = "_mat"+material_index;}
										current_object.object_material.combine_parent[material_index] = Instantiate(Combine_Children);
										if (current_object.combine_parent_name == ""){current_object.object_material.combine_parent[material_index].name = current_object.object1.name+mat_text;} else {current_object.object_material.combine_parent[material_index].name = current_object.combine_parent_name+mat_text;}
										current_object.object_material.combine_parent[material_index].transform.parent = current_object.parent;
									}
									object1.transform.parent = current_object.object_material.combine_parent[material_index].transform;
									
								} else {object1.transform.parent = current_object.parent;}
								
								current_object.object_material.combine_count[material_index] += 1;
								object1.name = current_object.object1.name+"_"+current_object.placed;
									
								if (current_layer.object_output.object.Count > 1)
								{
									current_layer.object_output.objects_placed.Add(position);
									if (current_layer.object_output.group_rotation){current_layer.object_output.objects_placed_rot.Add(rotation);}
								}
								++current_object.placed;
								++current_object.placed_prelayer;
								++current_layer.object_output.placed;
								++row_object_count;
								
								current_object.object2 = object1;
								
								if (current_object.prelayer_created)
								{
									if (prelayers[current_object.prelayer_index].prearea.active)
									{
										set_object_child(current_object,rotation);
										prelayer3.x += prelayer3.prearea.step.x;
										prelayer3.y = prelayer3.counter_y;
										if (prelayer3.x <= prelayer.prearea.area.xMax){prelayer3.break_x_value = prelayer3.x-prelayer3.prearea.area.x;}
										else {prelayer3.y -= prelayer3.prearea.step.y;prelayer3.break_x_value = 0;}
										prelayer_stack.Add(current_object.prelayer_index);
										prelayer = prelayers[prelayer_stack[prelayer_stack.Count-1]];
											
										prelayer.prearea.area.x = position.x+(prelayer.prearea.area_old.x*2);
										prelayer.prearea.area.y = position.z+(prelayer.prearea.area_old.y*2);
										
										prelayer.prearea.area.width = prelayer.prearea.area_old.width*scale.x;
										prelayer.prearea.area.height = prelayer.prearea.area_old.height*scale.z;
										
										if (rotation.y != 0)
										{
											prelayer.prearea.rotation = rotation;
											prelayer.prearea.rotation_active = true;
										}
										
										prelayer.prearea.step.y = Mathf.Sqrt(Mathf.Pow(prelayer.prearea.step_old.x,2)+Mathf.Pow(prelayer.prearea.step_old.y,2))/2;
										prelayer.prearea.step.x = prelayer.prearea.step.y;
										
										prelayer.prearea.center = Vector2(position.x,position.z);
										prelayer.y = prelayer.prearea.area.yMax; 
										return;
									}
								}
							} 
						}	
						break;
						
						// heightmap generate
						case layer_output_enum.heightmap:
							if (!button_export)
							{
								preterrain.heights[heightmap_y,heightmap_x] += filter_value*current_layer.strength;
							}
							break;	
						}
				// splatmap generate
				// colormap generate
				if (current_layer.output == layer_output_enum.color || current_layer.output == layer_output_enum.splat)
				{
					var stitching: boolean = false;
					
					if (current_layer.stitch)
					{
						
						if (map_y == preterrain.splatmap_resolution-1)
						{
							for (count_terrain = 0;count_terrain < terrains.Count;++count_terrain)
							{
								if (terrains[count_terrain].rect.Contains(Vector2(preterrain.rect.center.x,(counter_y+preterrain.splatmap_conversion.y))))
								{
									if (count_terrain == preterrain.index){continue;}
									for (count_value = 0;count_value < preterrain.splat_length;++count_value)
									{
										preterrain.splat_layer[count_value] = get_terrain_alpha(terrains[count_terrain],map_x*(terrains[count_terrain].splatmap_resolution/preterrain.splatmap_resolution),0,count_value);
									}
									stitching = true;
									break;
								}
							}
						}
						else if (map_x == 0)
						{
							for (count_terrain = 0;count_terrain < terrains.Count;++count_terrain)
							{
								if (count_terrain == preterrain.index){continue;}
								if (terrains[count_terrain].rect.Contains(Vector2(x-preterrain.splatmap_conversion.x,preterrain.rect.center.y)))
								{
									for (count_value = 0;count_value < preterrain.splat_length;++count_value)
									{
										preterrain.splat_layer[count_value] = get_terrain_alpha(terrains[count_terrain],terrains[count_terrain].splatmap_resolution-1,map_y*(terrains[count_terrain].splatmap_resolution/preterrain.splatmap_resolution),count_value);
									}
									stitching = true;
									break;
								}
							}
						}
					}
					if (!stitching)
					{
						for (count_value = 0;count_value < preterrain.splat.Length;++count_value)
						{
							preterrain.splat_layer[count_value] += preterrain.splat[count_value];
						}
					}
					for (count_value = 0;count_value < preterrain.splat.Length;++count_value)
					{
						preterrain.splat[count_value] = 0;
					}
				
				}
			}
			
			if (button_export)
			{
				var color3: Color;
				if (color_output || splat_output)
				{
					for (count_value = 0;count_value < 3;++count_value)
					{
						color3[count_value] = (preterrain.splat_layer[count_value]);
						preterrain.splat_layer[count_value] = 0;
					}
				}
				
				if (heightmap_output)
				{
					convert_16to8_bit(preterrain.heights[heightmap_y,heightmap_x]);
					color3[0] = 0;
					color3[1] = (byte_hi*1.0)/255;
					color3[2] = (byte_lo*1.0)/255;
					color3[3] = 0;
					
					export_bytes[((heightmap_x*2)+(heightmap_y*2049*2))] = byte_hi;
					export_bytes[(((heightmap_x*2)+1)+(heightmap_y*2049*2))] = byte_lo;
					
				}
				
				export_texture.SetPixel(map_x,map_y,color3); 
			}
			else
			{
				var splat_length: int = preterrain.splat_layer.Length/4;
				
				for (var count_alpha: int = 0;count_alpha < splat_length;++count_alpha)
				{    			        			    
				    for (count_value = 0;count_value < 4;++count_value)
					{
					    color3[count_value] = preterrain.splat_layer[(count_alpha*4)+count_value];
						preterrain.splat_layer[(count_alpha*4)+count_value] = 0;
					}
					preterrain.splat_alpha[count_alpha].SetPixel(map_x,map_y,color3);
				}
			}
			if (row_object_count > break_x_step)
			{
				prelayer3.break_x_value = (x-prelayer3.prearea.area.x)+prelayer3.prearea.step.x;
										
				row_object_count = 0;
				break_x = true;
				prelayer3.y = prelayer3.counter_y;
				return;
			}
		} 
		break_x = false; 
 		prelayer3.break_x_value = 0;
 		row_object_count = 0;
   }
   							
   prelayer3.y -= ((generate_step+1)*prelayer.prearea.step.y);
   
   generate_time = Time.realtimeSinceStartup - generate_time_start;
}  

function set_object_child(object: object_class,rotation: Vector3)
{
	for (var count_object: int = 0;count_object < object.object_child.Count;++count_object)
	{
		object.object_child[count_object].parent_rotation = rotation;
		if (!object.object_child[count_object].place_maximum_total){object.object_child[count_object].placed_prelayer = 0;}
		if (!object.object_child[count_object].parent || object.object_child[count_object].parent_set){object.object_child[count_object].parent = object.object2.transform;object.object_child[count_object].parent_set = true;}
	}
}

function create_object_child_list(object: object_class)
{
	if (!object.prelayer_created){return;}
	
	for (var count_layer: int = 0;count_layer < prelayers[object.prelayer_index].layer.Count;++count_layer)
	{
		if (prelayers[object.prelayer_index].layer[count_layer].output == layer_output_enum.object)
		{
			for (var count_object: int = 0;count_object < prelayers[object.prelayer_index].layer[count_layer].object_output.object.Count;++count_object)
			{
				object.object_child.Add(prelayers[object.prelayer_index].layer[count_layer].object_output.object[count_object]);
			}
		}
	}
}

function calc_filter_value(filter: filter_class,counter_y: float,x: float)
{
	var range: float;
	var value0: float;
	var color0: Color;
	var color1: Color;
	filter_input = 0;
	filter_strength *= filter.strength;
	
	if (filter.device == filter_devices_enum.Standard)
	{	
		switch (filter.type)
		{
			// height filter
			case condition_type_enum.Height:
				filter_input = height;
				break;
			
			// current filter
			case condition_type_enum.Current:
				if (filter.change_mode == change_mode_enum.filter){filter_input = filter_value;}
				break;
			
			// always filter
			case condition_type_enum.Always:
				filter_input = filter.curve_position;
				break;
			
			// steepness filter
			case condition_type_enum.Steepness:
				filter_input = degree/90;
				break;
			
			// direction filter
			case condition_type_enum.Direction:
				var curve_x: float;
				var curve_y: float;
				var curve_z: float;
				
				if (normal.x >= 0){curve_x = filter.precurve_x_right.curve.Evaluate(normal.x);}
					else {curve_x = filter.precurve_x_left.curve.Evaluate(normal.x);}
				if (normal.z >= 0){curve_z = filter.precurve_z_right.curve.Evaluate(normal.z);}
					else {curve_z = filter.precurve_z_left.curve.Evaluate(normal.z);}
				curve_y = filter.precurve_y.curve.Evaluate(normal.y);
				
				var curve_total = curve_x+curve_y+curve_z;
				filter_input = curve_total;
				break;
			
			// image filter
			case condition_type_enum.Image:
				color1 = calc_image_value(filter.preimage,layer_x,layer_y);
				if (filter.preimage.output)
				{
					filter_input = filter.preimage.output_pos;
				}
				break;
				
			// raw heightmap filter
			case condition_type_enum.RawHeightmap:
				calc_raw_value(filter.raw,layer_x,layer_y);
				filter_input = filter.raw.output_pos;
				break;
			
			// random filter
			case condition_type_enum.Random:
				filter_input = UnityEngine.Random.Range(0.0,1.0);
				break;
			
			//random range
			case condition_type_enum.RandomRange:
				if(random_range > filter.range_start && random_range < filter.range_end)
				{
					filter_input = UnityEngine.Random.Range(0.0,1.0);
				}
				break;
		}
	}
	else if (filter.device == filter_devices_enum.Math)
	{
		switch(filter.type2)
		{
			case device2_type_enum.Sin:
				filter_input = Mathf.Sin((x*1.0)/20);
				break;
			
			case device2_type_enum.Sin:
			filter_input = Mathf.Cos((x*1.0)/20);
				break;
		}
	}
	
	// curve
	for (var count_curve: int = 0;count_curve < filter.precurve_list.Count;++count_curve)
	{
		switch(filter.precurve_list[count_curve].type)
		{
			case curve_type_enum.Normal:
				filter_input = filter.precurve_list[count_curve].curve.Evaluate(filter_input);
				break;
			case curve_type_enum.Random:
			    range = filter.precurve_list[count_curve].curve.Evaluate(filter_input);
				if (!filter.precurve_list[count_curve].abs){filter_input += UnityEngine.Random.Range(-range,range);} else {filter_input += UnityEngine.Random.Range(0,range);}
				break;
			case curve_type_enum.Perlin:
				value0 = filter.precurve_list[count_curve].curve.Evaluate(filter_input);
				range = perlin_noise(prelayer.x,prelayer.counter_y,filter.precurve_list[count_curve].offset.x,filter.precurve_list[count_curve].offset.y,filter.precurve_list[count_curve].frequency,filter.precurve_list[count_curve].detail,filter.precurve_list[count_curve].detail_strength)*value0;
				if (!filter.precurve_list[count_curve].abs){filter_input += ((range*2)-(value0));} else {filter_input += range;}
				break;
		}
	}
								
	// subfilter
	if (filter.presubfilter.subfilter_index.Count > 0)
	{
		if (filter.sub_strength_set){subfilter_value = 0;} else {subfilter_value = 1;}

		// subfilters
		for (var count_subfilter: int = 0;count_subfilter < filter.presubfilter.subfilter_index.Count;++count_subfilter)
		{
			current_subfilter = subfilter[filter.presubfilter.subfilter_index[count_subfilter]];
			
			calc_subfilter_value(filter,current_subfilter,counter_y,x);	
		}
		 
		if (filter.last_value_declared)
		{
			var pos_x: int = (x-prelayer.prearea.area.xMin)/prelayer.prearea.step.x;
			filter.last_value_y[pos_x] = filter_input;
			filter.last_pos_x = pos_x;
			filter.last_value_x[0] = filter_input;
		}
	} 
	else
	{
		subfilter_value = 1;
	} 
	
	var splat_total: float = 0;
	
	if (!(filter.type == condition_type_enum.Image && filter.preimage.edge_blur))
	{
		if (current_layer.output == layer_output_enum.splat)
		{
			for (count_value = 0;count_value < current_layer.splat_output.splat.Count;++count_value)
			{
				current_layer.splat_output.splat_calc[count_value] = current_layer.splat_output.curves[count_value].curve.Evaluate(current_layer.splat_output.splat_value.curve.Evaluate(filter_input));
			}
		}
	}
	
	// color calculate
	if (current_layer.output == layer_output_enum.color)
	{
		if (filter.type == condition_type_enum.Image && filter.preimage.rgb)
		{
			color0 = color1;
		}
		else
		{
			color0[0] = current_layer.color_output.precolor_range[filter.color_output_index].curve_red.Evaluate(current_layer.color_output.precolor_range[filter.color_output_index].color_range_value.curve.Evaluate(filter_input));
			color0[1] = current_layer.color_output.precolor_range[filter.color_output_index].curve_green.Evaluate(current_layer.color_output.precolor_range[filter.color_output_index].color_range_value.curve.Evaluate(filter_input));
			color0[2] = current_layer.color_output.precolor_range[filter.color_output_index].curve_blue.Evaluate(current_layer.color_output.precolor_range[filter.color_output_index].color_range_value.curve.Evaluate(filter_input));
			color0[3] = 0;
		}
			
		if (export_color_advanced)
		{
			color0 *= export_color;
		
			if (export_color_curve_advanced)
			{
				color0[0] = export_color_curve_red.Evaluate(color0[0]);
				color0[1] = export_color_curve_green.Evaluate(color0[1]);
				color0[2] = export_color_curve_blue.Evaluate(color0[2]);
			}
			else
			{
				color0[0] = export_color_curve.Evaluate(color0[0]);
				color0[1] = export_color_curve.Evaluate(color0[1]);
				color0[2] = export_color_curve.Evaluate(color0[2]);
			}
		}
	}
	
	// grass calculate
	else if (current_layer.output == layer_output_enum.grass)
	{
		for (count_value = 0;count_value < current_layer.grass_output.grass_calc.Count;++count_value)
		{
			current_layer.grass_output.grass_calc[count_value] = current_layer.grass_output.curves[count_value].curve.Evaluate(current_layer.grass_output.grass_value.curve.Evaluate(filter_input));
		}
	}
		
	// filter output
	switch (filter.output)
	{
		// add filter
		case condition_output_enum.add:
			if (current_layer.output == layer_output_enum.heightmap){filter_value += filter_input*filter.strength*subfilter_value;}
				else {filter_value += filter_input;}
			if (current_layer.output == layer_output_enum.color)
			{
				for (count_value = 0;count_value < 3;++count_value)
				{
					preterrain.splat[count_value] += color0[count_value]*(current_layer.strength*filter.strength*subfilter_value);
				}
			}
			else if (current_layer.output == layer_output_enum.splat)
			{
				for (count_value = 0;count_value < current_layer.splat_output.splat.Count;++count_value)
				{
					preterrain.splat[current_layer.splat_output.splat[count_value]] += current_layer.splat_output.splat_calc[count_value]*(current_layer.strength*filter.strength*subfilter_value);
				}
			}
			else if (current_layer.output == layer_output_enum.grass)
			{
				for (count_value = 0;count_value < current_layer.grass_output.grass.Count;++count_value)
				{
					preterrain.grass[current_layer.grass_output.grass[count_value].prototypeindex] += current_layer.grass_output.grass_calc[count_value]*(current_layer.strength*filter.strength*subfilter_value);
				}
			}
			break;	
		
		// subtract filter
		case condition_output_enum.subtract:
			if (current_layer.output == layer_output_enum.heightmap){filter_value -= filter_input*filter.strength*subfilter_value;}
				else {filter_value -= filter_input;}
			if (current_layer.output == layer_output_enum.color)
			{
				for (count_value = 0;count_value < 3;++count_value)
				{
					preterrain.splat[count_value] -= (color0[count_value]*(current_layer.strength*filter.strength*subfilter_value));
				}
			}
			else if (current_layer.output == layer_output_enum.splat)
			{
				for(count_value = 0;count_value < current_layer.splat_output.splat.Count;++count_value)
				{
					preterrain.splat[current_layer.splat_output.splat[count_value]] -= current_layer.splat_output.splat_calc[count_value]*(current_layer.strength*filter.strength*subfilter_value);
				}
			}
			else if (current_layer.output == layer_output_enum.grass)
			{
				for (count_value = 0;count_value < current_layer.grass_output.grass.Count;++count_value)
				{
					preterrain.grass[current_layer.grass_output.grass[count_value].prototypeindex] -= current_layer.grass_output.grass_calc[count_value];
				}
			}
			break;
		
		// change filter
		case condition_output_enum.change:
			if (current_layer.output == layer_output_enum.heightmap){filter_value = (filter_value*(1-(subfilter_value*filter.strength)))+(filter_input*(subfilter_value*filter.strength));}
				else {filter_value = (filter_value*(1-(subfilter_value)))+(filter_input*(subfilter_value));}
			if (current_layer.output == layer_output_enum.color)
			{
				if (filter.type == condition_type_enum.Current)
				{
					if (filter.change_mode == change_mode_enum.filter)
					{
						for(count_value = 0;count_value < 3;++count_value)
						{
							preterrain.splat[count_value] = preterrain.splat[count_value]-(preterrain.splat[count_value]*(1-subfilter_value)*current_layer.strength*filter.strength);
						}
					}
					else
					{
						for(count_value = 0;count_value < 3;++count_value)
						{
							preterrain.splat_layer[count_value] = preterrain.splat_layer[count_value]-(preterrain.splat_layer[count_value]*(1-subfilter_value)*current_layer.strength*filter.strength);
						}
					}
				}
				else 
				{
					for(count_value = 0;count_value < 3;++count_value)
					{
						preterrain.splat_layer[count_value] = (preterrain.splat_layer[count_value]*(1-(subfilter_value*filter.strength*current_layer.strength)))+(color0[count_value]*subfilter_value*filter.strength*current_layer.strength);
					}
				}
			}
			else if (current_layer.output == layer_output_enum.splat)
			{
				if (filter.type == condition_type_enum.Current)
				{
					if (filter.change_mode == change_mode_enum.filter)
					{
						for(count_value = 0;count_value < preterrain.splat.Length;++count_value)
						{
							preterrain.splat[count_value] = preterrain.splat[count_value]-(preterrain.splat[count_value]*(1-subfilter_value)*current_layer.strength*filter.strength);
						}
					}
					else
					{
						for(count_value = 0;count_value < preterrain.splat.Length;++count_value)
						{	
							preterrain.splat_layer[count_value] = preterrain.splat_layer[count_value]-(preterrain.splat_layer[count_value]*(1-subfilter_value)*current_layer.strength*filter.strength);
						}
					}
				}
				else 
				{
					if (filter.change_mode == change_mode_enum.filter)
					{
						for (count_value = 0;count_value < current_layer.splat_output.splat.Count;++count_value)
						{
							preterrain.splat[current_layer.splat_output.splat[count_value]] = (preterrain.splat[current_layer.splat_output.splat[count_value]]*(1-(filter.strength*current_layer.strength*subfilter_value)))+(current_layer.splat_output.splat_calc[count_value]*subfilter_value*filter.strength*current_layer.strength);
						}
					}
					else
					{
						for (count_value = 0;count_value < preterrain.splat.Length;++count_value)
						{
							preterrain.splat_layer[count_value] = preterrain.splat_layer[count_value]*(1-(filter.strength*current_layer.strength*subfilter_value));
						}
						for (count_value = 0;count_value < current_layer.splat_output.splat.Count;++count_value)
						{
							preterrain.splat[current_layer.splat_output.splat[count_value]] += (current_layer.splat_output.splat_calc[count_value]*subfilter_value*filter.strength);
						}
					}
				}
			}
			break;
		
		// multiply	filter
		case condition_output_enum.multiply:
			if (current_layer.output == layer_output_enum.heightmap){filter_value *= filter_input*filter.strength*subfilter_value;}
				else {filter_value *= filter_input;}
			if (current_layer.output == layer_output_enum.color)
			{
				for (count_value = 0;count_value < current_layer.splat_output.splat.Count;++count_value)
				{
					preterrain.splat[count_value] *= color0[count_value]*(current_layer.strength*filter.strength*subfilter_value);
				}
			}
			else if (current_layer.output == layer_output_enum.splat)
			{
				for (count_value = 0;count_value < current_layer.splat_output.splat.Count;++count_value)
				{
					preterrain.splat[count_value] *= current_layer.splat_output.splat_calc[count_value]*(current_layer.strength*filter.strength*subfilter_value);
				}
			}
			else if (current_layer.output == layer_output_enum.grass)
			{
				for (count_value = 0;count_value < current_layer.grass_output.grass.Count;++count_value)
				{
					preterrain.grass[count_value] *= current_layer.grass_output.grass_calc[count_value]*(current_layer.strength*filter.strength*subfilter_value);		
				}
			}
			break;
		
		// devide filter
		case condition_output_enum.devide:
			
			if (current_layer.output == layer_output_enum.heightmap){if (filter_input*filter_strength*subfilter_value != 0){filter_value = filter_value / (filter_input*filter.strength*subfilter_value);}}
			else {if (filter_input != 0){filter_value = filter_value / filter_input;}}
			
			if (current_layer.output == layer_output_enum.color)
			{
				for(count_value = 0;count_value < current_layer.splat_output.splat.Count;++count_value)
				{
					if (color0[count_value]*(current_layer.strength*filter.strength*subfilter_value) != 0){preterrain.splat[count_value] = preterrain.splat[count_value]/(color0[count_value]*(current_layer.strength*filter.strength*subfilter_value));}
				}
			}
			else if (current_layer.output == layer_output_enum.splat)
			{
				for(count_value = 0;count_value < current_layer.splat_output.splat.Count;++count_value)
				{
					if (current_layer.splat_output.splat_calc[count_value]*(current_layer.strength*filter.strength*subfilter_value) != 0){preterrain.splat[count_value] = preterrain.splat[count_value]/(current_layer.splat_output.splat_calc[count_value]*(current_layer.strength*filter.strength*subfilter_value));}
				}
			}
			else if (current_layer.output == layer_output_enum.grass)
			{
				for (count_value = 0;count_value < current_layer.grass_output.grass.Count;++count_value)
				{
					if (current_layer.grass_output.grass_calc[count_value]*(current_layer.strength*filter.strength*subfilter_value) != 0){preterrain.grass[count_value] = preterrain.grass[count_value]/current_layer.grass_output.grass_calc[count_value]*(current_layer.strength*filter.strength*subfilter_value);}
				}
			}
			break;
		
		// average filter
		case condition_output_enum.average:
			if (current_layer.output == layer_output_enum.heightmap){filter_value += (filter_input*filter.strength*subfilter_value)/current_layer.prefilter.filter_index.Count;}
				else {filter_value += filter_input/current_layer.prefilter.filter_index.Count;}
			if (current_layer.output == layer_output_enum.color)
			{
				for(count_value = 0;count_value < 3;++count_value)
				{
					preterrain.splat[count_value] += (color0[0]*(current_layer.strength*filter.strength*subfilter_value))/current_layer.prefilter.filter_index.Count;
				}
			}
			else if (current_layer.output == layer_output_enum.splat)
			{
				for (count_value = 0;count_value < current_layer.splat_output.splat.Count;++count_value)
				{
					preterrain.splat[count_value] += (current_layer.splat_output.splat_calc[count_value]*(current_layer.strength*filter.strength*subfilter_value))/current_layer.prefilter.filter_index.Count;
				}
			}
			else if (current_layer.output == layer_output_enum.grass)
			{
				for (count_value = 0;count_value < current_layer.grass_output.grass.Count;++count_value)
				{
					preterrain.grass[count_value] += (current_layer.grass_output.grass_calc[count_value]*(current_layer.strength*filter.strength*subfilter_value))/current_layer.prefilter.filter_index.Count;		
				}
			}
			break;
			
		// difference filter
		case condition_output_enum.difference:
			if (current_layer.output == layer_output_enum.heightmap){filter_value  = Mathf.Abs(filter_value-(filter_input*filter.strength*subfilter_value));}
				else {filter_value = Mathf.Abs(filter_value-filter_input);}
			if (current_layer.output == layer_output_enum.color)
			{
				for(count_value = 0;count_value < 3;++count_value)
				{
					preterrain.splat[count_value] = Mathf.Abs(preterrain.splat[count_value]-(color0[0]*(current_layer.strength*filter.strength*subfilter_value)));
				}
			}
			else if (current_layer.output == layer_output_enum.splat)
			{
				for (count_value = 0;count_value < current_layer.splat_output.splat.Count;++count_value)
				{
					preterrain.splat[count_value] = Mathf.Abs(preterrain.splat[count_value]-(current_layer.splat_output.splat_calc[count_value]*(current_layer.strength*filter.strength*subfilter_value)));
				}
			}
			else if (current_layer.output == layer_output_enum.grass)
			{
				for (count_value = 0;count_value < current_layer.grass_output.grass.Count;++count_value)
				{
					preterrain.grass[count_value] = Mathf.Abs(preterrain.grass[count_value]-(current_layer.grass_output.grass_calc[count_value]*(current_layer.strength*filter.strength*subfilter_value)));		
				}
			}
			break;
			
		// max filter
		case condition_output_enum.max:
			if (filter_input*filter.strength > filter_value)
			{
				if (current_layer.output == layer_output_enum.heightmap){filter_value = filter_input*filter.strength*subfilter_value;}
					else {filter_value = filter_input;}
				if (current_layer.output == layer_output_enum.color)
				{
					for (count_value = 0;count_value < 3;++count_value)
					{
						preterrain.splat[count_value] = color0[count_value]*(current_layer.strength*filter.strength*subfilter_value);
					}
				}
				else if (current_layer.output == layer_output_enum.splat)
				{
					for (count_value = 0;count_value < current_layer.splat_output.splat.Count;++count_value)
					{
						preterrain.splat[count_value] = current_layer.splat_output.splat_calc[count_value]*(current_layer.strength*filter.strength*subfilter_value);
					}
				}
				else if (current_layer.output == layer_output_enum.grass)
				{
					for (count_value = 0;count_value < current_layer.grass_output.grass.Count;++count_value)
					{
						preterrain.grass[count_value] = current_layer.grass_output.grass_calc[count_value]*(current_layer.strength*filter.strength*subfilter_value);		
					}
				}
			}
			break;	
		
		// min filter
		case condition_output_enum.min:
			if (filter_input*filter.strength < filter_value)
			{
				if (current_layer.output == layer_output_enum.heightmap){filter_value = filter_input*filter.strength*subfilter_value;}
					else {filter_value = filter_input;}
				if (current_layer.output == layer_output_enum.color)
				{
					for (count_value = 0;count_value < 3;++count_value)
					{
						preterrain.splat[count_value] = color0[count_value]*(current_layer.strength*filter.strength*subfilter_value);
					}
				}
				else if (current_layer.output == layer_output_enum.splat)
				{
					for (count_value = 0;count_value < current_layer.splat_output.splat.Count;++count_value)
					{
						preterrain.splat[count_value] = current_layer.splat_output.splat_calc[count_value]*(current_layer.strength*filter.strength*subfilter_value);
					}
				}
				else if (current_layer.output == layer_output_enum.grass)
				{
					for (count_value = 0;count_value < current_layer.grass_output.grass.Count;++count_value)
					{
						preterrain.grass[count_value] = current_layer.grass_output.grass_calc[count_value]*(current_layer.strength*filter.strength*subfilter_value);		
					}
				}
			}
			break;
	}
} 	

// subfilter
function calc_subfilter_value(filter: filter_class,subfilter: subfilter_class,counter_y: float,x: float)
{
	var subfilter_input: float = 0;
	var random: float = UnityEngine.Random.Range(0.0,1.0);
	var range: float;
	var value0: float;
	var color: Color;
	var count_curve: int;

	switch (subfilter.type)
	{
		// random_range subfilter
		case condition_type_enum.RandomRange:
			if(random_range >= subfilter.range_start && random_range <= subfilter.range_end)
			{
				subfilter_input = random;
				++subfilter.range_count;
			}
			break;
		
		// random subfilter
		case condition_type_enum.Random:
			subfilter_input = random;
			break;
	
		// height subfilter
		case condition_type_enum.Height:
			subfilter_input = height;
			break;
		
		// steepness subfilter
		case condition_type_enum.Steepness:
			subfilter_input = degree/90;
			break;
		
		// always subfilter
		case condition_type_enum.Always:
			subfilter_input = subfilter.curve_position;
			break;
		
		// image subfilter
		case condition_type_enum.Image:
			color = calc_image_value(subfilter.preimage,layer_x,layer_y);	
			if (subfilter.preimage.output)
			{
				subfilter_input = subfilter.preimage.output_pos;
				if (current_layer.output == layer_output_enum.tree && subfilter.from_tree)
				{
					tree_color[0] = color[0]*subfilter.strength;
					tree_color[1] = color[1]*subfilter.strength;
					tree_color[2] = color[2]*subfilter.strength;
					for (count_curve = 0;count_curve < subfilter.precurve_list.Count;++count_curve)
					{
						switch(subfilter.precurve_list[count_curve].type)
						{
							case curve_type_enum.Normal:
								tree_color[0] = subfilter.precurve_list[count_curve].curve.Evaluate(tree_color[0]);
								tree_color[1] = subfilter.precurve_list[count_curve].curve.Evaluate(tree_color[1]);
								tree_color[2] = subfilter.precurve_list[count_curve].curve.Evaluate(tree_color[2]);
								break;
						}
					}
				}
			}
			break;
		
		// maxcount subfilter
		case condition_type_enum.MaxCount:
			if (subfilter.output_count >= subfilter.output_max)
			{
				subfilter_value = 0;
			}
			if (subfilter_value >= subfilter.output_count_min){++subfilter.output_count;}
			return;
	}
	
	for (count_curve = 0;count_curve < subfilter.precurve_list.Count;++count_curve)
	{
		switch(subfilter.precurve_list[count_curve].type)
		{
			case curve_type_enum.Normal:
				subfilter_input = subfilter.precurve_list[count_curve].curve.Evaluate(subfilter_input);
				break;
			case curve_type_enum.Random:
			    range = subfilter.precurve_list[count_curve].curve.Evaluate(subfilter_input);
				if (!subfilter.precurve_list[count_curve].abs){subfilter_input += UnityEngine.Random.Range(-range,range);} else {subfilter_input += UnityEngine.Random.Range(0,range);}
				break;
			case curve_type_enum.Perlin:
				value0 = subfilter.precurve_list[count_curve].curve.Evaluate(subfilter_input);
				range = perlin_noise(prelayer.x,prelayer.counter_y,subfilter.precurve_list[count_curve].offset.x,subfilter.precurve_list[count_curve].offset.y,subfilter.precurve_list[count_curve].frequency,subfilter.precurve_list[count_curve].detail,subfilter.precurve_list[count_curve].detail_strength)*value0;
				if (!subfilter.precurve_list[count_curve].abs){subfilter_input += ((range*2)-(value0));} else {subfilter_input += range;}
				break;
		}
	}
	
	if (subfilter.mode != subfilter_mode_enum.strength)
	{
		var curve1: float = filter_input;
		var curve2: float = filter_input;
		var pos_x: int = (x-prelayer.prearea.area.xMin)/prelayer.prearea.step.x;
		
		if (Mathf.Abs(pos_x - filter.last_pos_x) <= prelayer.prearea.step.x)
		{
			if (subfilter.mode == subfilter_mode_enum.smooth)
			{
				curve1 = Mathf.SmoothStep(filter.last_value_x[0],curve1,1-(subfilter_input))*subfilter.strength;
			}
			if (subfilter.mode == subfilter_mode_enum.lerp)
			{
				curve1 = Mathf.Lerp(filter.last_value_x[0],curve1,1-(subfilter_input))*subfilter.strength;
			}
		}
			
		for (var count_terrain: int = 0;count_terrain < terrains.Count;++count_terrain)
		{
			if (terrains[count_terrain].rect.Contains(Vector2(Mathf.Round(x/preterrain.heightmap_conversion.x)*preterrain.heightmap_conversion.x,(counter_y+preterrain.heightmap_conversion.y))))
			{
				if (count_terrain == preterrain.index)
				{
					if (subfilter.mode == subfilter_mode_enum.smooth)
					{
						curve2 = Mathf.SmoothStep(filter.last_value_y[pos_x],curve2,1-(subfilter_input))*subfilter.strength;
					}
					else if (subfilter.mode == subfilter_mode_enum.lerp)
					{
						curve2 = Mathf.Lerp(filter.last_value_y[pos_x],curve2,1-(subfilter_input))*subfilter.strength;
					}
				}
			}
		}
		filter_input = (curve1+curve2)/2;
		return;
	}
	
	switch (subfilter.output)
	{
		// add subfilter
		case subfilter_output_enum.add:
			subfilter_value += subfilter_input*subfilter.strength;
			break;

		// subtract subfilter					
		case subfilter_output_enum.subtract:
			subfilter_value -= subfilter_input*subfilter.strength;
			break;

		// min subfilter					
		case subfilter_output_enum.min:
			if ((subfilter_input*subfilter.strength) < subfilter_value){subfilter_value = (subfilter_input*subfilter.strength)+(subfilter_value*(1-subfilter.strength));}
			break;
		
		// max subfilter		
		case subfilter_output_enum.max:
			if ((subfilter_input*subfilter.strength) > subfilter_value){subfilter_value = (subfilter_input*subfilter.strength)+(subfilter_value*(1-subfilter.strength));}
			break;
		
		// average subfilter			
		case subfilter_output_enum.average:
			subfilter_value += (subfilter_input*subfilter.strength)/filter.presubfilter.subfilter_index.Count;
			break;
	}
}

function calc_raw_value(raw: raw_class,local_x: float,local_y: float)
{
	if (raw.raw_list_mode == list_condition_enum.Terrain)
	{
		if (preterrain.index > raw.file_index.Count-1){raw.raw_number = 0;} else {raw.raw_number = preterrain.index_old;}
	}
	if (raw.raw_number > raw.file_index.Count-1){raw.raw_number = 0;}
	
	var pos: Vector2;
	var width: float = 0;
	var height: float = 0;
	var flip_x: float = 1;
	var flip_y: float = 1;
	
	if (raw.flip_x){flip_x = -1;width = raw_files[raw.file_index[raw.raw_number]].resolution;} 
	if (raw.flip_y){flip_y = -1;height = raw_files[raw.file_index[raw.raw_number]].resolution;} 
	
	if (raw.raw_mode == image_mode_enum.MultiTerrain)
	{
		var tile_x: float;
		var tile_y: float;
		
		tile_x = ((((raw_files[raw.file_index[raw.raw_number]].resolution)/preterrain.tiles.x))*preterrain.tile_x);
		tile_y = (((raw_files[raw.file_index[raw.raw_number]].resolution/preterrain.tiles.y))*preterrain.tile_z);
		
		pos.x = Mathf.Round((((((local_x)/raw.conversion_step.x)+tile_x)*flip_x)-raw.tile_offset_x+width)/raw.tile_x);
		pos.y = Mathf.Round((((((local_y)/raw.conversion_step.y)+tile_y)*flip_y)-raw.tile_offset_y+height)/raw.tile_y);
		
	}
	else 
	{
		if (raw.raw_mode == image_mode_enum.Area)
		{
			pos.x = Mathf.Round(((((local_x-prelayer.prearea.area_old.x)/raw.conversion_step.x)*flip_x)-raw.tile_offset_x+width)/raw.tile_x);
			pos.y = Mathf.Round(((((local_y-prelayer.prearea.area_old.y)/raw.conversion_step.y)*flip_y)-raw.tile_offset_y+height)/raw.tile_y);
		}
		else
		{
			pos.x = Mathf.Round((((local_x/raw.conversion_step.x)*flip_x)-raw.tile_offset_x+width)/raw.tile_x);
			pos.y = Mathf.Round((((local_y/raw.conversion_step.y)*flip_y)-raw.tile_offset_y+height)/raw.tile_y);
		}
	
	}
	
	if (raw.rotation)
	{
		pos = calc_rotation_pixel(pos.x,pos.y,raw_files[raw.file_index[raw.raw_number]].resolution/2/raw.conversion_step.x,raw_files[raw.file_index[raw.raw_number]].resolution/2/raw.conversion_step.y,raw.rotation_value);
	}
	h_local_x = pos.x;
	h_local_y = pos.y;
					
	if (h_local_y < 0){h_local_y = 0;}
	if (h_local_y > raw_files[raw.file_index[raw.raw_number]].resolution-1){h_local_y = raw_files[raw.file_index[raw.raw_number]].resolution-1;}
	if (h_local_x < 0){h_local_x = 0;}
	if (h_local_x > raw_files[raw.file_index[raw.raw_number]].resolution-1){h_local_x = raw_files[raw.file_index[raw.raw_number]].resolution-1;}
	var index1: int = (h_local_y*(raw_files[raw.file_index[raw.raw_number]].resolution)*2)+(h_local_x*2);
				
	if (raw_files[raw.file_index[raw.raw_number]].mode == raw_mode_enum.Mac)
	{
    	raw.output_pos = ((raw_files[raw.file_index[raw.raw_number]].bytes[index1]*256.0)+raw_files[raw.file_index[raw.raw_number]].bytes[index1+1])/65535.0;
	}
	else if (raw_files[raw.file_index[raw.raw_number]].mode == raw_mode_enum.Windows)
	{
		raw.output_pos = (raw_files[raw.file_index[raw.raw_number]].bytes[index1]+(raw_files[raw.file_index[raw.raw_number]].bytes[index1+1]*256.0))/65535.0;
	}
}

function calc_pixel_edge(texture: Texture2D,local_x: int,local_y: int,radius: int,color: Color): float
{
	
}

function calc_image_value(preimage: image_class,local_x: float,local_y: float): Color
{
	if (preimage.image_list_mode == list_condition_enum.Terrain)
	{
		if (preterrain.index > preimage.image.Count-1){preimage.image_number = 0;} else {preimage.image_number = preterrain.index_old;}
	}
	if (preimage.image_number > preimage.image.Count-1){preimage.image_number = 0;}
	if (!preimage.image[preimage.image_number]){return Color(0,0,0);}
	
	var width: float = 0;
	var height: float = 0;
	var flip_x: float = 1;
	var flip_y: float = 1;
	var color1: Color;
	var output: float;
			
	// object prelayer offset
	local_x -= prelayer.prearea.image_offset.x;
	local_y -= prelayer.prearea.image_offset.y;
	
	var pos: Vector2;
	
	if (preimage.flip_x){flip_x = -1;width = preimage.image[preimage.image_number].width;} 
	if (preimage.flip_y){flip_y = -1;height = preimage.image[preimage.image_number].height;} 
	
	if (preimage.image_mode == image_mode_enum.Terrain)
	{
		pos.x = Mathf.Round((((local_x/preimage.conversion_step.x)*flip_x)-preimage.tile_offset_x+width)/preimage.tile_x);
		pos.y = Mathf.Round((((local_y/preimage.conversion_step.y)*flip_y)-preimage.tile_offset_y+height)/preimage.tile_y);
	}
	else 
	{
		if (preimage.image_mode == image_mode_enum.MultiTerrain)
		{
			var tile_x: float;
			var tile_y: float;
			
			tile_x = (((preimage.image[preimage.image_number].width)/preterrain.tiles.x))*preterrain.tile_x;
			tile_y = (((preimage.image[preimage.image_number].height)/preterrain.tiles.y))*preterrain.tile_z;
			
			pos.x = Mathf.Round(((((local_x/preimage.conversion_step.x)+tile_x)*flip_x)-preimage.tile_offset_x+width)/preimage.tile_x);
			pos.y = Mathf.Round(((((local_y/preimage.conversion_step.y)+tile_y)*flip_y)-preimage.tile_offset_y+height)/preimage.tile_y);
		}
		else
		{
			pos.x = ((((local_x-prelayer.prearea.area_old.x)/preimage.conversion_step.x)*flip_x)-preimage.tile_offset_x+width)/preimage.tile_x;
			pos.y = ((((local_y-prelayer.prearea.area_old.y)/preimage.conversion_step.y)*flip_y)-preimage.tile_offset_y+height)/preimage.tile_y;
		}
	}
	
	if (preimage.rotation)
	{
		pos = calc_rotation_pixel(pos.x,pos.y,preimage.image[preimage.image_number].width/2/preimage.conversion_step.x,preimage.image[preimage.image_number].height/2/preimage.conversion_step.y,preimage.rotation_value);
	}
	
	var inrange: boolean = true;
	
	if (preimage.clamp)
	{
		if (pos.x > preimage.image[preimage.image_number].width || pos.x < 0){inrange = false;}
		if (pos.y > preimage.image[preimage.image_number].height || pos.y < 0){inrange = false;}
	}
	
	if (inrange)
	{
		color1 = preimage.image[preimage.image_number].GetPixel(pos.x,pos.y);
	} 
	else {color1 = Color.black;}
	
	color1 *= preimage.image_color;
	
	preimage.output = true;
	preimage.output_pos = color1[0];
	
	if (!preimage.edge_blur || current_layer.output != layer_output_enum.splat)
	{
		if (preimage.precolor_range.color_range.Count > 0)
		{
			preimage.output = false;
			for (count_color_range = 0;count_color_range < preimage.precolor_range.color_range.Count;++count_color_range)
			{
				var color_start: Color = preimage.precolor_range.color_range[count_color_range].color_start;		
				var color_end: Color = preimage.precolor_range.color_range[count_color_range].color_end;
				
				if (preimage.select_mode == select_mode_enum.free)
				{
					output = preimage.precolor_range.color_range[count_color_range].output;
				}
				else
				{
					switch(current_layer.output)
					{
						case layer_output_enum.color:
							output = current_layer.color_output.precolor_range[0].color_range_value.select_value[preimage.precolor_range.color_range[count_color_range].select_output];				
							break;
						case layer_output_enum.splat:
							if (current_layer.splat_output.splat.Count > 0)
							{
								output = current_layer.splat_output.splat_value.select_value[preimage.precolor_range.color_range[count_color_range].select_output];				
							}
							break;
						case layer_output_enum.tree:
							output = current_layer.tree_output.tree_value.select_value[preimage.precolor_range.color_range[count_color_range].select_output];				
							break;
						case layer_output_enum.grass:
							output = current_layer.grass_output.grass_value.select_value[preimage.precolor_range.color_range[count_color_range].select_output];				
							break;
						case layer_output_enum.object:
							output = current_layer.object_output.object_value.select_value[preimage.precolor_range.color_range[count_color_range].select_output];				
							break;
					}
				}
				if (preimage.precolor_range.color_range[count_color_range].one_color)
				{
					if (preimage.precolor_range.color_range[count_color_range].color_start == color1 && !preimage.precolor_range.color_range[count_color_range].invert)
					{
						preimage.output_pos = output; 
						preimage.output = true;
					} 
					else if (preimage.precolor_range.color_range[count_color_range].invert)
					{
						preimage.output_pos = output;
						preimage.output = true;
					}
				}
				else if (color_in_range(color1,color_start,color_end))
				{
					if (!preimage.precolor_range.color_range[count_color_range].invert)
					{
						preimage.output_pos = preimage.precolor_range.color_range[count_color_range].precurve.curve.Evaluate(calc_color_pos(color1,color_start,color_end));
						preimage.output = true;
					}
				} 
				else 
				{
					if (preimage.precolor_range.color_range[count_color_range].invert)
					{
						preimage.output_pos = preimage.precolor_range.color_range[count_color_range].precurve.curve.Evaluate(calc_color_pos(color1,color_start,color_end));
						preimage.output = true;
					}
				}
			}	
		}
	}
	else
	{
		var value0: float;
		var radius: float = preimage.edge_blur_radius;
		var radius2: float = (radius*2)+1;
		pos.x -= radius;
		pos.y -= radius;
		if (pos.x < 0){pos.x = 0;radius2 -= radius;}
		if (pos.y < 0){pos.y = 0;radius2 -= radius;}
		if (pos.x > preimage.image[preimage.image_number].width-radius2-1){pos.x = preimage.image[preimage.image_number].width-radius2-1;radius2 -= radius;}
		if (pos.y > preimage.image[preimage.image_number].height-radius2-1){pos.y = preimage.image[preimage.image_number].height-radius2-1;radius2 -= radius;}
		
		var pixels: Color[] = preimage.image[preimage.image_number].GetPixels(pos.x,pos.y,radius2,radius2);
		
		for (var count_splat_calc: int = 0;count_splat_calc < current_layer.splat_output.splat_calc.Count;++count_splat_calc)
		{
			current_layer.splat_output.splat_calc[count_splat_calc] = 0;
		}
		
		for (var count_pixel: int = 0;count_pixel < pixels.Length;++count_pixel)
		{
			if (current_layer.splat_output.splat.Count > 0)
			{
				for (count_color_range = 0;count_color_range < preimage.precolor_range.color_range.Count;++count_color_range)
				{
					if (pixels[count_pixel] == preimage.precolor_range.color_range[count_color_range].color_start)
					{
						if (preimage.select_mode == select_mode_enum.free)
						{
							preimage.output_pos += preimage.precolor_range.color_range[count_color_range].output/(pixels.Length*1.0);
						}
						else
						{
							switch(current_layer.output)
							{
								case layer_output_enum.splat:
									output = current_layer.splat_output.splat_value.select_value[current_layer.splat_output.splat[preimage.precolor_range.color_range[count_color_range].select_output]];
									current_layer.splat_output.splat_calc[current_layer.splat_output.splat[output*current_layer.splat_output.splat.Count]] += 1.0/(pixels.Length*1.0);				
									break;
								/*case layer_output_enum.color:
									output = current_layer.color_output.precolor_range[current_filter.color_output_index].color_range_value.select_value[preimage.precolor_range.color_range[count_color_range].select_output];				
									break;
								case layer_output_enum.tree:
									output = current_layer.tree_output.tree_value.select_value[preimage.precolor_range.color_range[count_color_range].select_output];				
									break;
								case layer_output_enum.grass:
									output = current_layer.grass_output.grass_value.select_value[preimage.precolor_range.color_range[count_color_range].select_output];				
									current_layer.grass_output.grass_calc[current_layer.grass_output.grass[output*current_layer.grass_output.grass.Count].prototypeindex] += 1.0/(pixels.Length*1.0);
									break;
								case layer_output_enum.object:
									output = current_layer.object_output.object_value.select_value[preimage.precolor_range.color_range[count_color_range].select_output];				
									break;*/
							}
						}
					}
				}
			}
		}
	}
	
	return color1;
}

// loop prelayer
function loop_prelayer(command: String,index: int,loop_inactive: boolean)
{
	var clear_parent_object: boolean = false;
	var image_auto_scale: boolean = false;
	var texture_resize_null: boolean = false;
	var erase_deactive: boolean = false;
	var store_last_values: boolean = false;
	var unload_texture: boolean = false;
	var fold_layer: boolean = false;
	var create_object_child_list: boolean = false;
	var automatic_step_resolution: boolean = false;
	var fix_database: boolean = false;
	var info_database: boolean = false;
	var enable_heightmap_output: boolean = false;
	var reset_swap_copy: boolean = false;
	var stitch_heightmap: boolean = false;
	var check_measure_normal: boolean = false;
	var close_all_foldout: boolean = false;
	var foldout_filter: boolean = false;
	var foldout_subfilter: boolean = false;
	var load_raw_files: boolean = false;
	var generate_first_call: boolean = false;
	var set_as_default: boolean = false;
	var fold_layer_output: layer_output_enum;
	var fold_layers_foldout: boolean;
	var count_splat: int;
	var count_tree: int;
	var count_object: int;
	
	if (command.IndexOf("(gfc)") != -1){generate_first_call = true;}
	if (command.IndexOf("(cmn)") != -1){check_measure_normal = true;}
	if (command.IndexOf("(st)") != -1){stitch_heightmap = true;}
	if (command.IndexOf("(rsc") != -1){reset_swap_copy = true;}
	if (command.IndexOf("(ias)") != -1){image_auto_scale = true;}
	if (command.IndexOf("(trn)") != -1){texture_resize_null = true;}
	if (command.IndexOf("(ed)") != -1){erase_deactive = true;}
	if (command.IndexOf("(slv)") != -1){store_last_values = true;}
	if (command.IndexOf("(ut)") != -1){unload_texture = true;}
	if (command.IndexOf("(ocr)") != -1){create_object_child_list = true;}
	if (command.IndexOf("(asr)") != -1){automatic_step_resolution = true;}
	if (command.IndexOf("(cpo)") != -1){clear_parent_object = true;}
	if (command.IndexOf("(inf)") != -1){info_database = true;}
	if (command.IndexOf("(eho)") != -1){enable_heightmap_output = true;}
	if (command.IndexOf("(caf)") != -1){close_all_foldout = true;} 
	if (command.IndexOf("(ff)") != -1){foldout_filter = true;}
	if (command.IndexOf("(fs)") != -1){foldout_subfilter = true;}
	if (command.IndexOf("(lrf)") != -1){load_raw_files = true;}
	if (command.IndexOf("(sad)") != -1){set_as_default = true;}
	if (command.IndexOf("(fix)") != -1){fix_database = true;}
	
	if (fix_database || info_database)
	{
		reset_link_filter();
		reset_link_subfilter();
		settings.prelayers_linked = 0;
		settings.filters_linked = 0;
		settings.subfilters_linked = 0;
	}
	
	if (command.IndexOf("(fl)") != -1)
	{
		if (command.IndexOf("(heightmap)") != -1){fold_layer_output = layer_output_enum.heightmap;}
		else if (command.IndexOf("(color)") != -1){fold_layer_output = layer_output_enum.color;}
		else if (command.IndexOf("(splat)") != -1){fold_layer_output = layer_output_enum.splat;}
		else if (command.IndexOf("(tree)") != -1){fold_layer_output = layer_output_enum.tree;}
		else if (command.IndexOf("(grass)") != -1){fold_layer_output = layer_output_enum.grass;}
		else if (command.IndexOf("(object)") != -1){fold_layer_output = layer_output_enum.object;}
		
		if (command.IndexOf("(true)") != -1){fold_layers_foldout = true;} 
		else if (command.IndexOf("(false)") != -1){fold_layers_foldout = false;}
		fold_layer = true;
	}
	
	for (count_prelayer = 0;count_prelayer < prelayers.Count;++count_prelayer)
	{
		var prelayer1: prelayer_class = prelayers[count_prelayer];
		if (automatic_step_resolution)
		{
			if (prelayers[0].prearea.resolution_mode == resolution_mode_enum.Automatic){select_automatic_step_resolution(terrains[0],prelayers[count_prelayer].prearea);}
			set_area_resolution(terrains[0],prelayers[count_prelayer].prearea);
			prelayers[count_prelayer].prearea.area_old = prelayers[count_prelayer].prearea.area;
			prelayers[count_prelayer].prearea.step_old = prelayers[count_prelayer].prearea.step;
		}
		
		if (reset_swap_copy || close_all_foldout)
		{
			for (var count_description: int = 0;count_description < prelayers[count_prelayer].predescription.description.Count;++count_description)
			{
				if (reset_swap_copy)
				{
					prelayers[count_prelayer].predescription.description[count_description].swap_text = "S";
					prelayers[count_prelayer].predescription.description[count_description].swap_select = false;
					prelayers[count_prelayer].predescription.description[count_description].copy_select = false;
				}
				if (close_all_foldout)
				{
					prelayers[count_prelayer].predescription.description[count_description].foldout = false;
				}
			}
		}
		
		if (close_all_foldout)
		{
			prelayers[count_prelayer].prearea.foldout = false;
		}
		
		for (count_layer = 0;count_layer < prelayer1.layer.Count;++count_layer)
		{
			var current_layer1: layer_class = prelayer1.layer[count_layer];
			
			if (erase_deactive)
			{
				var erase_layer: boolean = false;
				if (!current_layer1.active){erase_layer = true;}
					else if(!((current_layer1.output == layer_output_enum.color && color_output) 
		        			|| (current_layer1.output == layer_output_enum.splat && splat_output)
		        				|| (current_layer1.output == layer_output_enum.tree && tree_output)
		        					|| (current_layer1.output == layer_output_enum.grass && grass_output)
		        						|| (current_layer1.output == layer_output_enum.object && object_output)
		        						 	|| (current_layer1.output == layer_output_enum.heightmap && heightmap_output)))
		        	{erase_layer = true;}
		        if (erase_layer){erase_layer(prelayer1,count_layer,0,0,false,true,false);--count_layer;continue;}
		        
		        if (current_layer1.output == layer_output_enum.color)
		     	{
		     		for (var count_precolor_range: int = 0;count_precolor_range < current_layer1.color_output.precolor_range.Count;++count_precolor_range)
			     	{
			     		for (var count_color_range: int = 0;count_color_range < current_layer1.color_output.precolor_range[count_precolor_range].color_range.Count;++count_color_range)
			     		{
			     			if (!current_layer1.color_output.precolor_range[count_precolor_range].color_range_value.active[count_color_range])
			     			{
			     				current_layer1.color_output.precolor_range[count_precolor_range].erase_color_range(count_color_range);
			     				loop_prefilter_index(current_layer1.prefilter,count_color_range);
				    			--count_color_range;
			     				continue;
			     			}
			     		}
			     	}
		     	}
		        else if (current_layer1.output == layer_output_enum.splat)
		        {
		        	for (count_splat = 0;count_splat < current_layer1.splat_output.splat.Count;++count_splat)
				    {
				    	if (!current_layer1.splat_output.splat_value.active[count_splat])
				    	{
				    		current_layer1.splat_output.erase_splat(count_splat);
				    		loop_prefilter_index(current_layer1.prefilter,count_splat);
				    		--count_splat;
				    		continue;
				    	}
				    	if (current_layer1.splat_output.splat[count_splat] > terrains[0].terrain.terrainData.splatPrototypes.Length-1){current_layer1.splat_output.splat[count_splat] = terrains[0].terrain.terrainData.splatPrototypes.Length-1;}
				    }
		        }
		        else if (current_layer1.output == layer_output_enum.grass)
				{
					for (var count_grass: int = 0;count_grass < current_layer1.grass_output.grass_value.active.Count;++count_grass)
					{
						if (!current_layer1.grass_output.grass_value.active[count_grass] || current_layer1.grass_output.grass[count_grass].prototypeindex > terrains[0].terrain.terrainData.detailPrototypes.Length-1)
						{
							current_layer1.grass_output.erase_grass(count_grass);
							loop_prefilter_index(current_layer1.prefilter,count_grass);
				    		--count_grass;
						}
					}
				}
			}
			
			if (reset_swap_copy)
			{
				current_layer1.swap_text = "S";
				current_layer1.swap_select = false;
				current_layer1.copy_select = false;
				current_layer1.tree_output.placed = 0;
				current_layer1.object_output.placed = 0;
				current_layer1.text_placed = String.Empty;
				
				for (count_tree = 0;count_tree < current_layer1.tree_output.tree.Count;++count_tree)
				{
					current_layer1.tree_output.tree[count_tree].placed = 0;
				}
				for (count_object = 0;count_object < current_layer1.object_output.object.Count;++count_object)
				{
					current_layer1.object_output.object[count_object].placed = 0;
				}
			}
			
			if (close_all_foldout)
			{
				current_layer1.foldout = false;
				
				current_layer1.tree_output.foldout = false;
				for (count_tree = 0;count_tree < current_layer1.tree_output.tree.Count;++count_tree)
				{
					current_layer1.tree_output.tree[count_tree].foldout = false;
					current_layer1.tree_output.tree[count_tree].scale_foldout = false;
					current_layer1.tree_output.tree[count_tree].distance_foldout = false;
					current_layer1.tree_output.tree[count_tree].data_foldout = false;
					current_layer1.tree_output.tree[count_tree].precolor_range.foldout = false;
				}
				
				current_layer1.object_output.foldout = false;
					
				for (count_object = 0;count_object < current_layer1.object_output.object.Count;++count_object)
				{
					current_layer1.object_output.object[count_object].foldout = false;
					current_layer1.object_output.object[count_object].data_foldout = false;
					current_layer1.object_output.object[count_object].transform_foldout = false;
					current_layer1.object_output.object[count_object].settings_foldout = false;
					current_layer1.object_output.object[count_object].distance_foldout = false;
					current_layer1.object_output.object[count_object].rotation_foldout = false;
					current_layer1.object_output.object[count_object].rotation_map_foldout = false;
				}
			}
			
			if (current_layer1.active || loop_inactive)
			{
				if (stitch_heightmap && current_layer1.active)
				{
					if (current_layer1.output == layer_output_enum.heightmap)
					{
						if (current_layer1.stitch){stitch_command = true;}
						if (current_layer1.smooth){smooth_command = true;}
					}
				}
				
				if (enable_heightmap_output)
				{
					if (current_layer1.active && current_layer1.output == layer_output_enum.heightmap){heightmap_output_layer = true;}
				}
				
				if (fold_layer)
				{
					if (current_layer1.output == fold_layer_output)
					{
						if (fold_layers_foldout){current_layer1.foldout = false;} else {current_layer1.foldout = true;}
					} else {current_layer1.foldout = false;}
				}
				
				for (count_tree = 0;count_tree < current_layer1.tree_output.tree.Count;++count_tree)
				{
					if (erase_deactive)
					{
						if (!current_layer1.tree_output.tree_value.active[count_tree])
						{
							current_layer1.tree_output.erase_tree(count_tree,this);
							loop_prefilter_index(current_layer1.prefilter,count_tree);
				    		--count_tree;
							continue;
						}
						else
						{
							erase_deactive_color_range(current_layer1.tree_output.tree[count_tree].precolor_range);
						}
					}
						
					// call loop tree prefilter
					call_from = 1;
					loop_prefilter(current_layer1.tree_output.tree[count_tree].prefilter,index,fix_database,info_database,loop_inactive,image_auto_scale,texture_resize_null,unload_texture,erase_deactive,store_last_values,reset_swap_copy,check_measure_normal,close_all_foldout,foldout_filter,foldout_subfilter,load_raw_files,set_as_default);
				}
				
				
				if (current_layer1.output == layer_output_enum.object)
				{
					for (count_object = 0;count_object < current_layer1.object_output.object.Count;++count_object)
					{
						if (erase_deactive && !current_layer1.object_output.object_value.active[count_object])
						{
							erase_object(prelayers[count_prelayer].layer[count_layer].object_output,count_object);
							loop_prefilter_index(current_layer1.prefilter,count_object);
				    		--count_object;
							continue;
						}
						
						var current_object1: object_class = current_layer1.object_output.object[count_object];
						
						if (fix_database || info_database)
						{
							if (current_object1.prelayer_created)
							{
								if (current_object1.prelayer_index > prelayers.Count-1)
								{
									if (!info_database)
									{
										Debug.Log("Prelayer reference -> "+current_object1.prelayer_index+" not found, erasing reference entry...");
										current_object1.prelayer_created = false;
										current_object1.prelayer_index = -1;
									}
								}
								else
								{
									if (!info_database){prelayers[current_object1.prelayer_index].linked = true;} else {settings.prelayers_linked += 1;}
								}
							}
						}
						if ((current_layer1.object_output.object_value.active[count_object]) && (object_output || loop_inactive) && clear_parent_object)
						{
							if (create_object_child_list){create_object_child_list(current_object1);}
							var parent: Transform = current_object1.parent;
							if (parent && current_object1.parent_clear)
							{
								var parent_id: int = parent.gameObject.GetInstanceID();
								var children: Transform[] = parent.GetComponentsInChildren.<Transform>(true);
								if (children)
								{
									for(var child: Transform in children)
									{
										if (child){if (child.gameObject.GetInstanceID() != parent_id){DestroyImmediate(child.gameObject);}}
									}
								}
							}
						}
					}
				}
				
				// call loop prefilter
				call_from = 0;
				loop_prefilter(current_layer1.prefilter,index,fix_database,info_database,loop_inactive,image_auto_scale,texture_resize_null,unload_texture,erase_deactive,store_last_values,reset_swap_copy,check_measure_normal,close_all_foldout,foldout_filter,foldout_subfilter,load_raw_files,set_as_default);
			}
		}
	}
	
	if (info_database || fix_database)
	{
		erase_unlinked_prelayer(fix_database);
		erase_unlinked_filter(fix_database);
		erase_unlinked_subfilter(fix_database);
	}
}

// loop prefilter
function loop_prefilter(prefilter1: prefilter_class,index: int,fix_database: boolean,info_database: boolean,loop_inactive: boolean,image_auto_scale: boolean,texture_resize_null: boolean,unload_texture: boolean,erase_deactive: boolean,store_last_values: boolean,reset_swap_copy: boolean,check_measure_normal: boolean,close_all_foldout: boolean,foldout_filter: boolean,foldout_subfilter: boolean,load_raw_files: boolean,set_as_default: boolean)
{
	if (close_all_foldout){prefilter1.foldout = false;}
	
	for (count_filter = 0;count_filter < prefilter1.filter_index.Count;++count_filter)
	{
		var current_filter1: filter_class = filter[prefilter1.filter_index[count_filter]];
		
		// erase filter
		if (erase_deactive)
		{
			if (!current_filter1.active)
			{
				erase_filter(count_filter,prefilter1);
				--count_filter;
				continue;
			}
			else 
			{
				erase_deactive_color_range(current_filter1.preimage.precolor_range);
				erase_deactive_animation_curve(current_filter1.precurve_list);
			} 
		}
		
		if (fix_database || info_database)
		{
			if (prefilter1.filter_index[count_filter] > filter.Count-1)
			{
				Debug.Log("Filter reference -> "+prefilter1.filter_index[count_filter]+" not found, erasing reference entry...");
				if (!info_database)
				{
					erase_filter_reference(prefilter1,count_filter);
					--count_filter;
					continue;
				}
			}
			else if (filter[prefilter1.filter_index[count_filter]].linked)
			{
				Debug.Log("Filter double linked -> "+prefilter1.filter_index[count_filter]);
				if (fix_database)
				{
					filter.Add(new filter_class());
					filter[filter.Count-1] = copy_filter(filter[prefilter1.filter_index[count_filter]],true);
					prefilter1.filter_index[count_filter] = filter.Count-1;
					continue;
				}
			}	
			else
			{	
				filter[prefilter1.filter_index[count_filter]].linked = true;
				if (filter[prefilter1.filter_index[count_filter]].linked){settings.filters_linked += 1;}
			}
		}
		
		if (foldout_filter)
		{
			if (prefilter1.filter_index[count_filter] == index)
			{
				var description_number: int = get_layer_description(prelayers[count_prelayer],count_layer);
				if (description_number != -1){prelayers[count_prelayer].predescription.description[description_number].foldout = true;}
				prelayers[count_prelayer].foldout = true;
				prelayers[count_prelayer].layer[count_layer].foldout = true;
				if (call_from == 1)
				{
					prelayers[count_prelayer].layer[count_layer].tree_output.foldout = true;
					prelayers[count_prelayer].layer[count_layer].tree_output.tree[count_tree].foldout = true;
				}
				prefilter1.foldout = true;
				current_filter1.foldout = true;
			}
		}
		if (set_as_default)
		{
			for (var count_curve: int = 0;count_curve < current_filter1.precurve_list.Count;++count_curve)
			{
				current_filter1.precurve_list[count_curve].set_as_default();
			}
		}
		if (close_all_foldout){current_filter1.foldout = false;current_filter1.presubfilter.foldout = false;}
		if (reset_swap_copy)
		{
			filter[prefilter1.filter_index[count_filter]].swap_text = "S";
			filter[prefilter1.filter_index[count_filter]].swap_select = false;
			filter[prefilter1.filter_index[count_filter]].copy_select = false;
		}
		
		if (check_measure_normal)
		{
			if (current_filter1.active && !measure_normal)
			{
				if (current_filter1.type == condition_type_enum.Direction)
				{
					measure_normal = true;
				}
			}
		}
		
		if (current_filter1.active || loop_inactive)
		{
			if (current_filter1.type == condition_type_enum.RawHeightmap && load_raw_files)
			{
				for (var count_index: int = 0;count_index < current_filter1.raw.file_index.Count;++count_index)
				{
					if (current_filter1.raw.file_index[count_index] > -1)
					{
						if (!raw_files[current_filter1.raw.file_index[count_index]].loaded)
						{
							if (!raw_files[current_filter1.raw.file_index[count_index]].exists())
							{
								script_base.erase_raw_file(count_index);
								erase_raw_file(count_index);
								current_filter1.raw.file_index.RemoveAt(count_index);
								--count_index;
								if (current_filter1.raw.file_index.Count == 0)
								{
									erase_filter(count_filter,prefilter1);
									--count_filter;
								}
								continue;
							}
							raw_files[current_filter1.raw.file_index[count_index]].bytes = File.ReadAllBytes(raw_files[current_filter1.raw.file_index[count_index]].file);
							raw_files[current_filter1.raw.file_index[count_index]].loaded = true;
							if (count_prelayer == 0 && !prelayers[0].prearea.active){current_filter1.raw.set_raw_auto_scale(terrains[0],terrains[0].prearea.area_old,raw_files,count_index);}
							else 
							{
								current_filter1.raw.set_raw_auto_scale(terrains[0],prelayers[count_prelayer].prearea.area_old,raw_files,count_index);
							}
						}
					} 
					else 
					{
						current_filter1.raw.file_index.RemoveAt(count_index);
						--count_index;
						if (current_filter1.raw.file_index.Count == 0)
						{
							erase_filter(count_filter,prefilter1);
							--count_filter;
							continue;
						}
					}
				}
			}
			
			if (image_auto_scale)
			{
				if (current_filter1.preimage.image_auto_scale)
				{
					if (!prelayers[count_prelayer].prearea.active){current_filter1.preimage.set_image_auto_scale(terrains[0],terrains[0].prearea.area_old,0);}
					else 
					{
						current_filter1.preimage.set_image_auto_scale(terrains[0],prelayers[count_prelayer].prearea.area_old,0);
					}
				}
			}
			// filter_index-1 from erase filter
			if (unload_texture)
			{
				if (current_filter1.preimage.image.Count > 0)
				{
					for (var count_image: int = 0;count_image < current_filter1.preimage.image.Count;++count_image)
					{
						if (current_filter.preimage.image[count_image]){UnityEngine.Resources.UnloadAsset(current_filter1.preimage.image[count_image]);}
					}
				}
			}
			// reset sub strength set
			current_filter1.sub_strength_set = false;
						
			// loop subfilter
			for (count_subfilter = 0;count_subfilter < current_filter1.presubfilter.subfilter_index.Count;++count_subfilter)
			{
				var current_subfilter1: subfilter_class = subfilter[current_filter1.presubfilter.subfilter_index[count_subfilter]];
				
				if (erase_deactive)
				{
					if (!current_subfilter1.active)
					{
						erase_subfilter(count_subfilter,current_filter1.presubfilter);
						--count_subfilter;
						continue;
					}
					else 
					{
					 	erase_deactive_animation_curve(current_subfilter1.precurve_list);
						erase_deactive_color_range(current_subfilter1.preimage.precolor_range);
					}
				}
				
				if (fix_database || info_database)
				{
					if (current_filter1.presubfilter.subfilter_index[count_subfilter] > subfilter.Count-1)
					{
						Debug.Log("Subfilter reference -> "+current_filter1.presubfilter.subfilter_index[count_subfilter]+" not found, erasing reference entry...");
						if (!info_database)
						{
							erase_subfilter_reference(current_filter1.presubfilter,count_subfilter);
							--count_subfilter;
							continue;
						}
					}
					if (subfilter[current_filter1.presubfilter.subfilter_index[count_subfilter]].linked)
					{
						Debug.Log("Subfilter double linked -> "+current_filter1.presubfilter.subfilter_index[count_subfilter]);
						if (fix_database)
						{
							subfilter.Add(new subfilter_class());
							subfilter[subfilter.Count-1] = copy_subfilter(subfilter[current_filter1.presubfilter.subfilter_index[count_subfilter]]);
							current_filter1.presubfilter.subfilter_index[count_subfilter] = subfilter.Count-1;
							continue;
						}
					}
					else
					{
						subfilter[current_filter1.presubfilter.subfilter_index[count_subfilter]].linked = true;
						if (filter[prefilter1.filter_index[count_filter]].linked){settings.subfilters_linked += 1;}
					}
				}
				
				if (foldout_subfilter)
				{
					if (current_filter1.presubfilter.subfilter_index[count_subfilter] == index)
					{
						var description_number1: int = get_layer_description(prelayers[count_prelayer],count_layer);
						if (description_number1 != -1){prelayers[count_prelayer].predescription.description[description_number1].foldout = true;}
						prelayers[count_prelayer].foldout = true;
						prelayers[count_prelayer].layer[count_layer].foldout = true;
						if (call_from == 1)
						{
							prelayers[count_prelayer].layer[count_layer].tree_output.foldout = true;
							prelayers[count_prelayer].layer[count_layer].tree_output.tree[count_tree].foldout = true;
						}
						prefilter1.foldout = true;
						current_subfilter1.foldout = true;
						current_filter1.foldout = true;
						current_filter1.presubfilter.foldout = true;
					}
				}
				if (set_as_default)
				{
					current_subfilter1.precurve.set_as_default();
					current_subfilter1.prerandom_curve.set_as_default();
				}
				if (close_all_foldout){current_subfilter1.foldout = false;}
				if (check_measure_normal)
				{
					if (current_subfilter1.active && !measure_normal)
					{
						if (current_subfilter1.type == condition_type_enum.Direction)
						{
							measure_normal = true;
						}
					}
				}
				if (reset_swap_copy)
				{
					current_subfilter1.swap_text = "S";
					current_subfilter1.swap_select = false;
					current_subfilter1.copy_select = false;
				}
				
				if (current_subfilter1.active || loop_inactive)
				{
					if (image_auto_scale)
					{
						if (current_subfilter1.preimage.image_auto_scale)
						{
							if (!prelayers[count_prelayer].prearea.active){current_subfilter1.preimage.set_image_auto_scale(terrains[0],terrains[0].prearea.area_old,0);}
							else {current_subfilter1.preimage.set_image_auto_scale(terrains[0],prelayers[count_prelayer].prearea.area_old,0);}
						}
					}
					if (current_subfilter1.mode == subfilter_mode_enum.strength){current_filter1.sub_strength_set = true;} 
					if (store_last_values && current_subfilter1.mode != subfilter_mode_enum.strength && !current_filter.last_value_declared)
					{
						current_filter1.last_value_x = new float[1];
						if (generate_world_mode)
						{
							current_filter1.last_value_y = new float[(prelayers[count_prelayer].prearea.area.width/prelayers[count_prelayer].prearea.step.x)+1];
						}
						else
						{
							current_filter1.last_value_y = new float[(terrains[0].size.x/terrains[0].prearea.step.x)+2];	
						}
						current_filter1.last_pos_x = 4097;
						current_filter1.last_value_declared = true;
					}
								
					if (unload_texture)
					{
						for (count_image = 0;count_image < current_subfilter1.preimage.image.Count;++count_image)
						{							
							if (current_subfilter1.preimage.image)
							{
								UnityEngine.Resources.UnloadAsset(current_subfilter1.preimage.image[count_image]);
							}
						}
					}	
				}
			}
		}
	}
}

function loop_prefilter_index(prefilter1: prefilter_class,index: int)
{
	for (var count_filter: int = 0;count_filter < prefilter1.filter_index.Count;++count_filter)
	{
		if (filter[prefilter1.filter_index[count_filter]].type == condition_type_enum.Image)
		{	
			if (filter[prefilter1.filter_index[count_filter]].preimage.select_mode == select_mode_enum.select)
			{
				for (var count_color_range: int = 0;count_color_range < filter[prefilter1.filter_index[count_filter]].preimage.precolor_range.color_range.Count;++count_color_range)
				{
					if (filter[prefilter1.filter_index[count_filter]].preimage.precolor_range.color_range[count_color_range].select_output == index)
					{
						filter[prefilter1.filter_index[count_filter]].preimage.precolor_range.erase_color_range(count_color_range);
						--count_color_range;
						continue;
					}
					if (filter[prefilter1.filter_index[count_filter]].preimage.precolor_range.color_range[count_color_range].select_output > index){filter[prefilter1.filter_index[count_filter]].preimage.precolor_range.color_range[count_color_range].select_output = index;}
				}
			}
		}
	}	
}

function disable_prefilter_select_mode(prefilter1: prefilter_class)
{
	for (var count_filter: int = 0;count_filter < prefilter1.filter_index.Count;++count_filter)
	{
		filter[prefilter1.filter_index[count_filter]].preimage.select_mode = select_mode_enum.free;
	}	
}

function link_placed_reference()
{
	var count_layer: int;
	var count_tree: int;
	var count_object: int;
	
	for (var count_prelayer: int = 0;count_prelayer < prelayers.Count;++count_prelayer)
	{
		for (count_layer = 0;count_layer < prelayers[count_prelayer].layer.Count;++count_layer)
		{
			if (prelayers[count_prelayer].layer[count_layer].active)
			{
				if (prelayers[count_prelayer].layer[count_layer].output == layer_output_enum.tree)
				{
					prelayers[count_prelayer].layer[count_layer].tree_output.placed = 0;
					script_base.prelayers[count_prelayer].layer[count_layer].tree_output.placed_reference = prelayers[count_prelayer].layer[count_layer].tree_output;
					for (count_tree = 0;count_tree < prelayers[count_prelayer].layer[count_layer].tree_output.tree.Count;++count_tree)
					{
						prelayers[count_prelayer].layer[count_layer].tree_output.tree[count_tree].placed = 0;
						script_base.prelayers[count_prelayer].layer[count_layer].tree_output.tree[count_tree].placed_reference = prelayers[count_prelayer].layer[count_layer].tree_output.tree[count_tree];
					}
				}
				if (prelayers[count_prelayer].layer[count_layer].output == layer_output_enum.object)
				{
					prelayers[count_prelayer].layer[count_layer].object_output.placed = 0;
					script_base.prelayers[count_prelayer].layer[count_layer].object_output.placed_reference = prelayers[count_prelayer].layer[count_layer].object_output;
					prelayers[count_prelayer].layer[count_layer].object_output.placed_reference = script_base.prelayers[count_prelayer].layer[count_layer].object_output;
					
					
					if (prelayers[count_prelayer].layer[count_layer].object_output.object_mode == object_mode_enum.LinePlacement)
					{
						script_base.prelayers[count_prelayer].layer[count_layer].object_output.line_placement.line_list[0].points.Clear();
						for (var count_point: int = 0;count_point < prelayers[count_prelayer].layer[count_layer].object_output.line_placement.line_list[0].point_length;++count_point)
						{
							script_base.prelayers[count_prelayer].layer[count_layer].object_output.line_placement.line_list[0].points.Add(Vector3(0,0,0));
						}
						if (prelayers[count_prelayer].layer[count_layer].object_output.line_placement.preimage.image_auto_scale)
						{
							if (!generate_world_mode && count_prelayer < 1){prelayers[count_prelayer].layer[count_layer].object_output.line_placement.preimage.set_image_auto_scale(terrains[0],terrains[0].prearea.area_old,0);}
							else {prelayers[count_prelayer].layer[count_layer].object_output.line_placement.preimage.set_image_auto_scale(terrains[0],prelayers[count_prelayer].prearea.area_old,0);}
						}
						line_output = true;
					}
					
					for (count_object = 0;count_object < prelayers[count_prelayer].layer[count_layer].object_output.object.Count;++count_object)
					{
						prelayers[count_prelayer].layer[count_layer].object_output.object[count_object].placed = 0;
						script_base.prelayers[count_prelayer].layer[count_layer].object_output.object[count_object].placed_reference = prelayers[count_prelayer].layer[count_layer].object_output.object[count_object];
					}
				}
			}
		}
	}
}

function line_generate(count_prelayer: int)
{
	var count_layer: int;
	var count_tree: int;
	var count_object: int;
	
	for (count_layer = 0;count_layer < prelayers[count_prelayer].layer.Count;++count_layer)
	{
		if (prelayers[count_prelayer].layer[count_layer].output == layer_output_enum.object)
		{
			if (prelayers[count_prelayer].layer[count_layer].object_output.object_mode == object_mode_enum.LinePlacement)
			{
				create_object_line(prelayers[count_prelayer].layer[count_layer].object_output);
			}
		}
	}
}

function erase_deactive_color_range(precolor_range: precolor_range_class)
{
	for (var count_color_range: int = 0;count_color_range < precolor_range.color_range.Count;++count_color_range)
	{
		if (!precolor_range.color_range_value.active[count_color_range]){precolor_range.erase_color_range(count_color_range);--count_color_range;}
	}
}

function erase_deactive_animation_curve(precurve_list: List.<animation_curve_class>)
{
	for (var count_curve: int = 0;count_curve < precurve_list.Count;++count_curve)
	{
		if (!precurve_list[count_curve].active){erase_animation_curve(precurve_list,count_curve);--count_curve;}
	}
}

function clear_parent_object(current_object1: object_class)
{
	var parent: Transform = current_object1.parent;
	if (parent && current_object1.parent_clear)
	{
		var parent_id: int = parent.gameObject.GetInstanceID();
		var children: Transform[] = parent.GetComponentsInChildren.<Transform>(true);
		if (children)
		{
			for(var child: Transform in children)
			{
				if (child){if (child.gameObject.GetInstanceID() != parent_id){DestroyImmediate(child.gameObject);}}
			}
		}
	}
}

function unload_textures1()
{
	var count_image: int;
	for (var count_filter: int = 0;count_filter < filter.Count;++count_filter)
	{
		for (count_image = 0;count_image < filter[count_filter].preimage.image.Count;++count_image)
		{
			if (filter[count_filter].preimage.image[count_image]){UnityEngine.Resources.UnloadAsset(filter[count_filter].preimage.image[count_image]);}
		}
	}
	for (var count_subfilter: int = 0;count_subfilter < subfilter.Count;++count_subfilter)
	{
		for (count_image = 0;count_image < subfilter[count_subfilter].preimage.image.Count;++count_image)
		{
			if (subfilter[count_subfilter].preimage.image[count_image]){UnityEngine.Resources.UnloadAsset(subfilter[count_subfilter].preimage.image[count_image]);}	
		}
	}
	for (var count_terrain: int = 0;count_terrain < terrains.Count;++count_terrain)
	{
		if (terrains[count_terrain].terrain.terrainData.splatPrototypes.Length > 0)
		{
			for (var count_alpha: int = 0;count_alpha < terrains[count_terrain].splat_alpha.Length;++count_alpha)
			{
				if (terrains[count_terrain].splat_alpha[count_alpha]){terrains[count_terrain].splat_alpha[count_alpha] = null;}
			}
		}
	}
}

function loop_layer(layer: layer_class,command: int)
{
	for (var count_object: int = 0;count_object < layer.object_output.object.Count;++count_object)
	{
		if (layer.object_output.object[count_object].prelayer_created)
		{
			if (command == 1)
			{
				add_prelayer(false);
				var prelayer_index: int = prelayers.Count-1;
				prelayers[prelayer_index] = copy_prelayer(prelayers[layer.object_output.object[count_object].prelayer_index],true);
				layer.object_output.object[count_object].prelayer_index = prelayer_index;
				prelayers[prelayer_index].index = prelayer_index;
				prelayers[prelayer_index].set_prelayer_text();
				
				for (var count_layer: int = 0;count_layer < prelayers[prelayer_index].layer.Count;++count_layer)
				{
					loop_layer(prelayers[prelayer_index].layer[count_layer],1);
				}
			}
			else if (command == -1)
			{
				erase_prelayer(layer.object_output.object[count_object].prelayer_index);
			}
		}
	}
}

function loop_object_copy(object: object_class)
{
	if (object.prelayer_created)
	{
		for (var count_layer: int = 0;count_layer < prelayers[object.prelayer_index].layer.Count;++count_layer)
		{
			loop_layer_copy(prelayers[object.prelayer_index].layer[count_layer]);
		}
	}
}

function loop_layer_copy(layer: layer_class)
{
	for (var count_object: int = 0;count_object < layer.object_output.object.Count;++count_object)
	{
		layer.object_output.object[count_object].swap_select = false;
		layer.object_output.object[count_object].copy_select = false;
		layer.object_output.object[count_object].swap_text = "S";
		layer.object_output.object[count_object].placed = 0;
		layer.object_output.placed = 0;
		
		if (layer.object_output.object[count_object].prelayer_created)
		{
			var prelayer_index: int = layer.object_output.object[count_object].prelayer_index;
			for (var count_layer: int = 0;count_layer < prelayers[prelayer_index].layer.Count;++count_layer)
			{
				loop_layer_copy(prelayers[prelayer_index].layer[count_layer]);
			}
		}
	}
	
	var count_color_range: int;
	
	for (var count_precolor_range: int = 0;count_precolor_range < layer.color_output.precolor_range.Count;++count_precolor_range)
	{
		for (count_color_range = 0;count_color_range < layer.color_output.precolor_range[count_precolor_range].color_range.Count;++count_color_range)
		{
			layer.color_output.precolor_range[count_precolor_range].color_range[count_color_range].swap_select = false;
			layer.color_output.precolor_range[count_precolor_range].color_range[count_color_range].copy_select = false;
			layer.color_output.precolor_range[count_precolor_range].color_range[count_color_range].swap_text = "S";
		}
	}
	
	for (var count_tree: int = 0;count_tree < layer.tree_output.tree.Count;++count_tree)
	{
		layer.tree_output.tree[count_tree].swap_select = false;
		layer.tree_output.tree[count_tree].copy_select = false;
		layer.tree_output.tree[count_tree].swap_text = "S";
		layer.tree_output.placed = 0;
		layer.tree_output.tree[count_tree].placed = 0;
		layer.tree_output.tree[count_tree].placed = 0;
	}
				
	layer.swap_select = false;
	layer.copy_select = false;
	layer.swap_text = "S";
	
}

function check_object_rotate(objects_placed: List.<Vector3>,objects_placed_rot: List.<Vector3>,position: Vector3,min_distance_rot_x: int,min_distance_rot_z: int): int
{
	var distance: Vector3;
	
	for (var count_object: int = 0;count_object < objects_placed.Count;++count_object)
	{
		distance = position-objects_placed[count_object];
		if (Mathf.Abs(distance.x) <= min_distance_rot_x && Mathf.Abs(distance.z) <= min_distance_rot_z){return count_object;}
	}
	return -1;
}

function check_object_distance(object_placed_list: List.<distance_class>): boolean
{
	var distance: float;
	var distance_z: float;
	
	for (var count_object: int = object_placed_list.Count-1;count_object >= 0;--count_object)
	{
		distance = Vector3.Distance(object_info.position,object_placed_list[count_object].position);
		distance_z = object_placed_list[count_object].position.z-object_info.position.z;
		
		if (distance < object_info.min_distance.x+object_placed_list[count_object].min_distance.x)
		{
			return false;
		}
	}
	object_placed_list.Add(new distance_class());
	
	object_placed_list[object_placed_list.Count-1].position = object_info.position;
	object_placed_list[object_placed_list.Count-1].rotation = object_info.rotation;
	object_placed_list[object_placed_list.Count-1].min_distance = object_info.min_distance;
	object_placed_list[object_placed_list.Count-1].min_distance_rotation_group = object_info.min_distance_rotation_group;
	object_placed_list[object_placed_list.Count-1].distance_rotation = object_info.distance_rotation;
	object_placed_list[object_placed_list.Count-1].distance_mode = object_info.distance_mode;
	object_placed_list[object_placed_list.Count-1].rotation_group = object_info.rotation_group;
	return true;
}

function relink_subfilter_index(subfilter_index: int)
{
	for(var count_filter: int = 0;count_filter < filter.Count;++count_filter)
	{
		for (var count_subfilter: int = 0;count_subfilter < filter[count_filter].presubfilter.subfilter_index.Count;++count_subfilter)
		{
			if (filter[count_filter].presubfilter.subfilter_index[count_subfilter] == subfilter.Count)
			{
				filter[count_filter].presubfilter.subfilter_index[count_subfilter] = subfilter_index;
				return;
			}						
		}
	}
}

function relink_filter_index(filter_index: int)
{
	for(var count_prelayer: int = 0;count_prelayer < prelayers.Count;++count_prelayer)
	{
		for(var count_layer: int = 0;count_layer < prelayers[count_prelayer].layer.Count;++count_layer)
		{
			for(var count_filter: int = 0;count_filter < prelayers[count_prelayer].layer[count_layer].prefilter.filter_index.Count;++count_filter)
			{
				if (prelayers[count_prelayer].layer[count_layer].prefilter.filter_index[count_filter] == filter.Count)
				{
					prelayers[count_prelayer].layer[count_layer].prefilter.filter_index[count_filter] = filter_index;
					return;
				}
			}
			for (var count_tree: int = 0;count_tree < prelayers[count_prelayer].layer[count_layer].tree_output.tree.Count;++count_tree)
			{
				for (count_filter = 0;count_filter < prelayers[count_prelayer].layer[count_layer].tree_output.tree[count_tree].prefilter.filter_index.Count;++count_filter)
				{
					if (prelayers[count_prelayer].layer[count_layer].tree_output.tree[count_tree].prefilter.filter_index[count_filter] == filter.Count)
					{
						prelayers[count_prelayer].layer[count_layer].tree_output.tree[count_tree].prefilter.filter_index[count_filter] = filter_index;
						return;
					}
				}
			}
		}
	}
}

function search_filter_index(filter_index: int): boolean
{
	for(var count_prelayer: int = 0;count_prelayer < prelayers.Count;++count_prelayer)
	{
		for(var count_layer: int = 0;count_layer < prelayers[count_prelayer].layer.Count;++count_layer)
		{
			for(var count_filter: int = 0;count_filter < prelayers[count_prelayer].layer[count_layer].prefilter.filter_index.Count;++count_filter)
			{
				if (prelayers[count_prelayer].layer[count_layer].prefilter.filter_index[count_filter] == filter_index)
				{
					filter[filter_index].linked = true;
					return true;
				}
			}
			for (var count_tree: int = 0;count_tree < prelayers[count_prelayer].layer[count_layer].tree_output.tree.Count;++count_tree)
			{
				for (count_filter = 0;count_filter < prelayers[count_prelayer].layer[count_layer].tree_output.tree[count_tree].prefilter.filter_index.Count;++count_filter)
				{
					if (prelayers[count_prelayer].layer[count_layer].tree_output.tree[count_tree].prefilter.filter_index[count_filter] == filter_index)
					{
						filter[filter_index].linked = true;
						return true;
					}
				}
			}
		}
	}
	return false;
}

function search_subfilter_index(subfilter_index: int):boolean
{
	for(var count_filter: int = 0;count_filter < filter.Count;++count_filter)
	{
		for (var count_subfilter: int = 0;count_subfilter < filter[count_filter].presubfilter.subfilter_index.Count;++count_subfilter)
		{
			if (filter[count_filter].presubfilter.subfilter_index[count_subfilter] == subfilter_index)
			{
				subfilter[subfilter_index].linked = true;
				return true;
			}						
		}
	}
	return false;
}

function reset_link_prelayer()
{
	for (var count_prelayer: int = 0;count_prelayer < prelayers.Count;++count_prelayer)
	{
		prelayers[count_prelayer].linked = false;
	}
}

function reset_link_filter()
{
	for (var count_filter: int = 0;count_filter < filter.Count;++count_filter)
	{
		filter[count_filter].linked = false;
	}
}

function reset_link_subfilter()
{
	for (var count_subfilter: int = 0;count_subfilter < subfilter.Count;++count_subfilter)
	{
		subfilter[count_subfilter].linked = false;
	}
}

function erase_unlinked_prelayer(erase: boolean)
{
	for (var count_prelayer: int = 1;count_prelayer < prelayers.Count;++count_prelayer)
	{
		if (!prelayers[count_prelayer].linked)
		{
			if (erase)
			{
				Debug.Log("Erasing unlinked Prelayer -> "+count_prelayer);
				erase_prelayer(count_prelayer);
				--count_prelayer;
			}
			else
			{
				Debug.Log("Unlinked Prelayer -> "+count_prelayer);
			}
		}
	}
}

function erase_unlinked_filter(erase: boolean)
{
	for (var count_filter: int = 0;count_filter < filter.Count;++count_filter)
	{
		if (!filter[count_filter].linked)
		{
			if (erase)
			{
				Debug.Log("Erasing unlinked Filter -> "+count_filter);
				erase_filter_unlinked(count_filter);
				--count_filter;
			}
			else
			{
				Debug.Log("Unlinked Filter -> "+count_filter);
			}
		}
	}
}

function erase_unlinked_subfilter(erase: boolean)
{
	for (var count_subfilter: int = 0;count_subfilter < subfilter.Count;++count_subfilter)
	{
		if (!subfilter[count_subfilter].linked)
		{
			if (erase)
			{
				Debug.Log("Erasing unlinked Subfilter -> "+count_subfilter);
				erase_subfilter_unlinked(count_subfilter);		
				--count_subfilter;
			}
			else
			{
				Debug.Log("Unlinked subfilter -> "+count_subfilter);
			}
		}	
	}
}

function select_image_prelayer()
{
	var current_filter1: filter_class;
	for (var count_layer: int = 0;count_layer < prelayer.layer.Count;++count_layer)
	{
		for (var count_filter: int = 0;count_filter < prelayer.layer[count_layer].prefilter.filter_index.Count;++count_filter)
		{
			current_filter1 = filter[prelayer.layer[count_layer].prefilter.filter_index[count_filter]];
			select_image_filter(current_filter1);
			select_image_subfilter(current_filter1);
		}
		if (prelayer.layer[count_layer].output == layer_output_enum.tree)
		{
			for (var count_tree: int = 0;count_tree < prelayer.layer[count_layer].tree_output.tree.Count;++count_tree)
			{
				for (count_filter = 0;count_filter < prelayer.layer[count_layer].tree_output.tree[count_tree].prefilter.filter_index.Count;++count_filter)
				{
					current_filter1 = filter[prelayer.layer[count_layer].tree_output.tree[count_tree].prefilter.filter_index[count_filter]];
					select_image_filter(current_filter1);
					select_image_subfilter(current_filter1);
				}
			}
		}
	}
}

function select_image_filter(current_filter1: filter_class)
{
	if (current_filter1.type == condition_type_enum.Image)
	{
		if (current_filter1.preimage.image_list_mode == list_condition_enum.Random)
		{
			current_filter1.preimage.image_number = UnityEngine.Random.Range(0,current_filter1.preimage.image.Count-1);
		}
	}
}

function select_image_subfilter(current_filter1: filter_class)
{
	var current_subfilter: subfilter_class;
	for (var count_subfilter: int = 0;count_subfilter < current_filter1.presubfilter.subfilter_index.Count;++count_subfilter)
	{
		current_subfilter = subfilter[current_filter1.presubfilter.subfilter_index[count_subfilter]];
		if (current_subfilter.type == condition_type_enum.Image)
		{
		    if (current_subfilter.preimage.image_list_mode == list_condition_enum.Random)
			{
				current_subfilter.preimage.image_number = UnityEngine.Random.Range(0,current_subfilter.preimage.image.Count-1);
			}
		}
	}
}

function search_filter_swap(): int
{
	for (var count_filter: int;count_filter < filter.Count;++count_filter)
	{
		if (filter[count_filter].swap_select){return count_filter;}
	}
	return -1;
}

function search_filter_copy(): int
{
	for (var count_filter: int;count_filter < filter.Count;++count_filter)
	{
		if (filter[count_filter].copy_select){return count_filter;}
	}
	return -1;
}

function search_subfilter_swap(): int
{
	for (var count_subfilter: int;count_subfilter < subfilter.Count;++count_subfilter)
	{
		if (subfilter[count_subfilter].swap_select){return count_subfilter;}
	}
	return -1;
}

function search_subfilter_copy(): int
{
	for (var count_subfilter: int;count_subfilter < subfilter.Count;++count_subfilter)
	{
		if (subfilter[count_subfilter].copy_select){return count_subfilter;}
	}
	copy_subfilter_select = false;
	return -1;
}

function search_layer_swap()
{
	for (var count_prelayer: int = 0;count_prelayer < prelayers.Count;++count_prelayer)
	{
		for (var count_layer: int = 0;count_layer < prelayers[count_prelayer].layer.Count;++count_layer)
		{
			if (prelayers[count_prelayer].layer[count_layer].swap_select){swap_prelayer_index = count_prelayer;swap_layer_index = count_layer;return;}
		}
	}
}

function search_layer_copy()
{
	for (var count_prelayer: int = 0;count_prelayer < prelayers.Count;++count_prelayer)
	{
		for (var count_layer: int = 0;count_layer < prelayers[count_prelayer].layer.Count;++count_layer)
		{
			if (prelayers[count_prelayer].layer[count_layer].copy_select){copy_prelayer_index = count_prelayer;copy_layer_index = count_layer;return;}
		}
	}
}

function search_description_swap()
{
	for (var count_prelayer: int = 0;count_prelayer < prelayers.Count;++count_prelayer)
	{
		for (var count_description: int = 0;count_description < prelayers[count_prelayer].predescription.description.Count;++count_description)
		{
			if (prelayers[count_prelayer].predescription.description[count_description].swap_select)
			{
				swap_description_prelayer_index = count_prelayer;
				swap_description_position = count_description;
				return;
			}
		}
	}
}

function search_description_copy()
{
	for (var count_prelayer: int = 0;count_prelayer < prelayers.Count;++count_prelayer)
	{
		for (var count_description: int = 0;count_description < prelayers[count_prelayer].predescription.description.Count;++count_description)
		{
			if (prelayers[count_prelayer].predescription.description[count_description].copy_select)
			{
				copy_description_prelayer_index = count_prelayer;
				copy_description_position = count_description;
				return;
			}
		}
	}
}

function search_object_swap()
{
	for (var count_prelayer: int = 0;count_prelayer < prelayers.Count;++count_prelayer)
	{
		for (var count_layer: int = 0;count_layer < prelayers[count_prelayer].layer.Count;++count_layer)
		{
			for (var count_object: int = 0;count_object < prelayers[count_prelayer].layer[count_layer].object_output.object.Count;++count_object)
			{
				if (prelayers[count_prelayer].layer[count_layer].object_output.object[count_object].swap_select)
				{
					swap_object_output = prelayers[count_prelayer].layer[count_layer].object_output;
					swap_object_number = count_object;
					return;
				}
			}
		}
	}
}

function search_object_copy(): object_class
{
	for (var count_prelayer: int = 0;count_prelayer < prelayers.Count;++count_prelayer)
	{
		for (var count_layer: int = 0;count_layer < prelayers[count_prelayer].layer.Count;++count_layer)
		{
			for (var count_object: int = 0;count_object < prelayers[count_prelayer].layer[count_layer].object_output.object.Count;++count_object)
			{
				if (prelayers[count_prelayer].layer[count_layer].object_output.object[count_object].copy_select){return prelayers[count_prelayer].layer[count_layer].object_output.object[count_object];}
			}
		}
	}
	return new object_class();
}

function search_tree_swap()
{
	for (var count_prelayer: int = 0;count_prelayer < prelayers.Count;++count_prelayer)
	{
		for (var count_layer: int = 0;count_layer < prelayers[count_prelayer].layer.Count;++count_layer)
		{
			for (var count_tree: int = 0;count_tree < prelayers[count_prelayer].layer[count_layer].tree_output.tree.Count;++count_tree)
			{
				if (prelayers[count_prelayer].layer[count_layer].tree_output.tree[count_tree].swap_select)
				{
					swap_tree_output = prelayers[count_prelayer].layer[count_layer].tree_output;
					swap_tree_position = count_tree;
					return;
				}			
			}
		}
	}
}

function search_tree_copy(): tree_class
{
	for (var count_prelayer: int = 0;count_prelayer < prelayers.Count;++count_prelayer)
	{
		for (var count_layer: int = 0;count_layer < prelayers[count_prelayer].layer.Count;++count_layer)
		{
			for (var count_tree: int = 0;count_tree < prelayers[count_prelayer].layer[count_layer].tree_output.tree.Count;++count_tree)
			{
				if (prelayers[count_prelayer].layer[count_layer].tree_output.tree[count_tree].copy_select)
				{
					return prelayers[count_prelayer].layer[count_layer].tree_output.tree[count_tree];
				}			
			}
		}
	}
	return new tree_class(script,false);
}

function search_color_range_swap()
{
	var count_color_range: int;
	
	for (var count_prelayer: int = 0;count_prelayer < prelayers.Count;++count_prelayer)
	{
		for (var count_layer: int = 0;count_layer < prelayers[count_prelayer].layer.Count;++count_layer)
		{
			for (var count_precolor_range: int = 0;count_precolor_range < prelayers[count_prelayer].layer[count_layer].color_output.precolor_range.Count;++count_precolor_range)
			{
				for (count_color_range = 0;count_color_range < prelayers[count_prelayer].layer[count_layer].color_output.precolor_range[count_precolor_range].color_range.Count;++count_color_range)
				{
					if (prelayers[count_prelayer].layer[count_layer].color_output.precolor_range[count_precolor_range].color_range[count_color_range].swap_select)
					{
						swap_precolor_range = prelayers[count_prelayer].layer[count_layer].color_output.precolor_range[count_precolor_range];
						swap_color_range_number = count_color_range;
						return;
					}
				}
			}
			for (var count_tree: int = 0;count_tree < prelayers[count_prelayer].layer[count_layer].tree_output.tree.Count;++count_tree)
			{
				for (count_color_range = 0;count_color_range < prelayers[count_prelayer].layer[count_layer].tree_output.tree[count_tree].precolor_range.color_range.Count;++count_color_range)
				{
					if (prelayers[count_prelayer].layer[count_layer].tree_output.tree[count_tree].precolor_range.color_range[count_color_range].swap_select)
					{
						swap_precolor_range = prelayers[count_prelayer].layer[count_layer].tree_output.tree[count_tree].precolor_range;
						swap_color_range_number = count_color_range;
						
						return;
					}
				}
			}
		}
	}
	
	for (var count_filter: int = 0;count_filter < filter.Count;++count_filter)
	{
		for (count_color_range = 0;count_color_range < filter[count_filter].preimage.precolor_range.color_range.Count;++count_color_range)
		{
			if (filter[count_filter].preimage.precolor_range.color_range[count_color_range].swap_select)
			{
				swap_precolor_range = filter[count_filter].preimage.precolor_range;
				swap_color_range_number = count_color_range;
				return;
			}
		}
	}
	
	for (var count_subfilter: int = 0;count_subfilter < subfilter.Count;++count_subfilter)
	{
		for (count_color_range = 0;count_color_range < subfilter[count_subfilter].preimage.precolor_range.color_range.Count;++count_color_range)
		{
			if (subfilter[count_subfilter].preimage.precolor_range.color_range[count_color_range].swap_select)
			{
				swap_precolor_range = subfilter[count_subfilter].preimage.precolor_range;
				swap_color_range_number = count_color_range;
				return;
			}
		}
	}
	
	for (var count_pattern: int = 0;count_pattern < pattern_tool.patterns.Count;++count_pattern)
	{
		for (count_color_range = 0;count_color_range < pattern_tool.patterns[count_pattern].precolor_range.color_range.Count;++count_color_range)
		{
			if (pattern_tool.patterns[count_pattern].precolor_range.color_range[count_color_range].swap_select)
			{
				swap_precolor_range = pattern_tool.patterns[count_pattern].precolor_range;
				swap_color_range_number = count_color_range;
				return;
			}
		}
	}
	
	for (count_color_range = 0;count_color_range < texture_tool.precolor_range.color_range.Count;++count_color_range)
	{
		if (texture_tool.precolor_range.color_range[count_color_range].swap_select)
		{
			swap_precolor_range = texture_tool.precolor_range;
			swap_color_range_number = count_color_range;
			return;
		}
	}
}

function search_color_range_copy(): color_range_class
{
	var count_color_range: int;
	
	for (var count_prelayer: int = 0;count_prelayer < prelayers.Count;++count_prelayer)
	{
		for (var count_layer: int = 0;count_layer < prelayers[count_prelayer].layer.Count;++count_layer)
		{
			for (var count_precolor_range: int = 0;count_precolor_range < prelayers[count_prelayer].layer[count_layer].color_output.precolor_range.Count;++count_precolor_range)
			{
				for (count_color_range = 0;count_color_range < prelayers[count_prelayer].layer[count_layer].color_output.precolor_range[count_precolor_range].color_range.Count;++count_color_range)
				{
					if (prelayers[count_prelayer].layer[count_layer].color_output.precolor_range[count_precolor_range].color_range[count_color_range].copy_select)
					{
						return prelayers[count_prelayer].layer[count_layer].color_output.precolor_range[count_precolor_range].color_range[count_color_range];
					}
				}
			}
			for (var count_tree: int = 0;count_tree < prelayers[count_prelayer].layer[count_layer].tree_output.tree.Count;++count_tree)
			{
				for (count_color_range = 0;count_color_range < prelayers[count_prelayer].layer[count_layer].tree_output.tree[count_tree].precolor_range.color_range.Count;++count_color_range)
				{
					if (prelayers[count_prelayer].layer[count_layer].tree_output.tree[count_tree].precolor_range.color_range[count_color_range].copy_select)
					
					return prelayers[count_prelayer].layer[count_layer].tree_output.tree[count_tree].precolor_range.color_range[count_color_range];
				}
			}
		}
	}
	
	for (var count_filter: int = 0;count_filter < filter.Count;++count_filter)
	{
		for (count_color_range = 0;count_color_range < filter[count_filter].preimage.precolor_range.color_range.Count;++count_color_range)
		{
			if (filter[count_filter].preimage.precolor_range.color_range[count_color_range].copy_select)
			{
				return filter[count_filter].preimage.precolor_range.color_range[count_color_range];
			}
		}
	}
	
	for (var count_subfilter: int = 0;count_subfilter < subfilter.Count;++count_subfilter)
	{
		for (count_color_range = 0;count_color_range < subfilter[count_subfilter].preimage.precolor_range.color_range.Count;++count_color_range)
		{
			if (subfilter[count_subfilter].preimage.precolor_range.color_range[count_color_range].copy_select)
			{
				return subfilter[count_subfilter].preimage.precolor_range.color_range[count_color_range];
			}
		}
	}
	
	for (var count_pattern: int = 0;count_pattern < pattern_tool.patterns.Count;++count_pattern)
	{
		for (count_color_range = 0;count_color_range < pattern_tool.patterns[count_pattern].precolor_range.color_range.Count;++count_color_range)
		{
			if (pattern_tool.patterns[count_pattern].precolor_range.color_range[count_color_range].copy_select)
			{
				return pattern_tool.patterns[count_pattern].precolor_range.color_range[count_color_range];
			}
		}
	}
	
	for (count_color_range = 0;count_color_range < texture_tool.precolor_range.color_range.Count;++count_color_range)
	{
		if (texture_tool.precolor_range.color_range[count_color_range].copy_select)
		{
			return texture_tool.precolor_range.color_range[count_color_range];
		}
	}
	
	return new color_range_class();
}

function get_terrain_resolution_to_list(preterrain1: terrain_class)
{
	if (preterrain1.heightmap_resolution == 4097){preterrain1.heightmap_resolution_list = 0;}
	else if (preterrain1.heightmap_resolution == 2049){preterrain1.heightmap_resolution_list = 1;}
	else if (preterrain1.heightmap_resolution == 1025){preterrain1.heightmap_resolution_list = 2;}
	else if (preterrain1.heightmap_resolution == 513){preterrain1.heightmap_resolution_list = 3;}
	else if (preterrain1.heightmap_resolution == 257){preterrain1.heightmap_resolution_list = 4;}
	else if (preterrain1.heightmap_resolution == 129){preterrain1.heightmap_resolution_list = 5;}
	else if (preterrain1.heightmap_resolution == 65){preterrain1.heightmap_resolution_list = 6;}
	else if (preterrain1.heightmap_resolution == 33){preterrain1.heightmap_resolution_list = 7;}
	
	if (preterrain1.splatmap_resolution == 2048){preterrain1.splatmap_resolution_list = 0;}
	else if (preterrain1.splatmap_resolution == 1024){preterrain1.splatmap_resolution_list = 1;}
	else if (preterrain1.splatmap_resolution == 512){preterrain1.splatmap_resolution_list = 2;}
	else if (preterrain1.splatmap_resolution == 256){preterrain1.splatmap_resolution_list = 3;}
	else if (preterrain1.splatmap_resolution == 128){preterrain1.splatmap_resolution_list = 4;}
	else if (preterrain1.splatmap_resolution == 64){preterrain1.splatmap_resolution_list = 5;}
	else if (preterrain1.splatmap_resolution == 32){preterrain1.splatmap_resolution_list = 6;}
	else if (preterrain1.splatmap_resolution == 16){preterrain1.splatmap_resolution_list = 7;}
	
	if (preterrain1.basemap_resolution == 2048){preterrain1.basemap_resolution_list = 0;}
	else if (preterrain1.basemap_resolution == 1024){preterrain1.basemap_resolution_list = 1;}
	else if (preterrain1.basemap_resolution == 512){preterrain1.basemap_resolution_list = 2;}
	else if (preterrain1.basemap_resolution == 256){preterrain1.basemap_resolution_list = 3;}
	else if (preterrain1.basemap_resolution == 128){preterrain1.basemap_resolution_list = 4;}
	else if (preterrain1.basemap_resolution == 64){preterrain1.basemap_resolution_list = 5;}
	else if (preterrain1.basemap_resolution == 32){preterrain1.basemap_resolution_list = 6;}
	else if (preterrain1.basemap_resolution == 16){preterrain1.basemap_resolution_list = 7;}
	
	if (preterrain1.detail_resolution == 2048){preterrain1.detailmap_resolution_list = 0;}
	else if (preterrain1.detail_resolution == 1024){preterrain1.detailmap_resolution_list = 1;}
	else if (preterrain1.detail_resolution == 512){preterrain1.detailmap_resolution_list = 2;}
	else if (preterrain1.detail_resolution == 256){preterrain1.detailmap_resolution_list = 3;}
	else if (preterrain1.detail_resolution == 128){preterrain1.detailmap_resolution_list = 4;}
	else if (preterrain1.detail_resolution == 64){preterrain1.detailmap_resolution_list = 5;}
	else if (preterrain1.detail_resolution == 32){preterrain1.detailmap_resolution_list = 6;}
	else if (preterrain1.detail_resolution == 16){preterrain1.detailmap_resolution_list = 7;}
	else if (preterrain1.detail_resolution == 8){preterrain1.detailmap_resolution_list = 8;}
	
	if (preterrain1.detail_resolution_per_patch == 128){preterrain1.detail_resolution_per_patch_list = 4;}
	else if (preterrain1.detail_resolution_per_patch == 64){preterrain1.detail_resolution_per_patch_list = 3;}
	else if (preterrain1.detail_resolution_per_patch == 32){preterrain1.detail_resolution_per_patch_list = 2;}
	else if (preterrain1.detail_resolution_per_patch == 16){preterrain1.detail_resolution_per_patch_list = 1;}
	else if (preterrain1.detail_resolution_per_patch == 8){preterrain1.detail_resolution_per_patch_list = 0;}
}

function set_terrain_resolution_from_list(preterrain1: terrain_class)
{
	if (preterrain1.heightmap_resolution_list == 0){preterrain1.heightmap_resolution = 4097;}
	else if (preterrain1.heightmap_resolution_list == 1){preterrain1.heightmap_resolution = 2049;}
	else if (preterrain1.heightmap_resolution_list == 2){preterrain1.heightmap_resolution = 1025;}
	else if (preterrain1.heightmap_resolution_list == 3){preterrain1.heightmap_resolution = 513;}
	else if (preterrain1.heightmap_resolution_list == 4){preterrain1.heightmap_resolution = 257;}
	else if (preterrain1.heightmap_resolution_list == 5){preterrain1.heightmap_resolution = 129;}
	else if (preterrain1.heightmap_resolution_list == 6){preterrain1.heightmap_resolution = 65;}
	else if (preterrain1.heightmap_resolution_list == 7){preterrain1.heightmap_resolution = 33;}
	
	if (preterrain1.splatmap_resolution_list == 0){preterrain1.splatmap_resolution = 2048;}
	else if (preterrain1.splatmap_resolution_list == 1){preterrain1.splatmap_resolution = 1024;}
	else if (preterrain1.splatmap_resolution_list == 2){preterrain1.splatmap_resolution = 512;}
	else if (preterrain1.splatmap_resolution_list == 3){preterrain1.splatmap_resolution = 256;}
	else if (preterrain1.splatmap_resolution_list == 4){preterrain1.splatmap_resolution = 128;}
	else if (preterrain1.splatmap_resolution_list == 5){preterrain1.splatmap_resolution = 64;}
	else if (preterrain1.splatmap_resolution_list == 6){preterrain1.splatmap_resolution = 32;}
	else if (preterrain1.splatmap_resolution_list == 7){preterrain1.splatmap_resolution = 16;}
	
	if (preterrain1.basemap_resolution_list == 0){preterrain1.basemap_resolution = 2048;}
	else if (preterrain1.basemap_resolution_list == 1){preterrain1.basemap_resolution = 1024;}
	else if (preterrain1.basemap_resolution_list == 2){preterrain1.basemap_resolution = 512;}
	else if (preterrain1.basemap_resolution_list == 3){preterrain1.basemap_resolution = 256;}
	else if (preterrain1.basemap_resolution_list == 4){preterrain1.basemap_resolution = 128;}
	else if (preterrain1.basemap_resolution_list == 5){preterrain1.basemap_resolution = 64;}
	else if (preterrain1.basemap_resolution_list == 6){preterrain1.basemap_resolution = 32;}
	else if (preterrain1.basemap_resolution_list == 7){preterrain1.basemap_resolution = 16;}
	
	if (preterrain1.detailmap_resolution_list == 0){preterrain1.detail_resolution = 2048;}
	else if (preterrain1.detailmap_resolution_list == 1){preterrain1.detail_resolution = 1024;}
	else if (preterrain1.detailmap_resolution_list == 2){preterrain1.detail_resolution = 512;}
	else if (preterrain1.detailmap_resolution_list == 3){preterrain1.detail_resolution = 256;}
	else if (preterrain1.detailmap_resolution_list == 4){preterrain1.detail_resolution = 128;}
	else if (preterrain1.detailmap_resolution_list == 5){preterrain1.detail_resolution = 64;}
	else if (preterrain1.detailmap_resolution_list == 6){preterrain1.detail_resolution = 32;}
	else if (preterrain1.detailmap_resolution_list == 7){preterrain1.detail_resolution = 16;}
	else if (preterrain1.detailmap_resolution_list == 8){preterrain1.detail_resolution = 8;}
	
	if (preterrain1.detail_resolution_per_patch_list == 0){preterrain1.detail_resolution_per_patch = 8;}
	else if (preterrain1.detail_resolution_per_patch_list == 1){preterrain1.detail_resolution_per_patch = 16;}
	else if (preterrain1.detail_resolution_per_patch_list == 2){preterrain1.detail_resolution_per_patch = 32;}
	else if (preterrain1.detail_resolution_per_patch_list == 3){preterrain1.detail_resolution_per_patch = 64;}
	else if (preterrain1.detail_resolution_per_patch_list == 4){preterrain1.detail_resolution_per_patch = 128;}
}

function get_terrains_position()
{
	for (var count_terrain: int = 0;count_terrain < terrains.Count;++count_terrain)
	{
		terrains[count_terrain].rect.x = terrains[count_terrain].terrain.transform.position.x;
	    terrains[count_terrain].rect.y = terrains[count_terrain].terrain.transform.position.z;
	    terrains[count_terrain].rect.width = terrains[count_terrain].terrain.terrainData.size.x;
	    terrains[count_terrain].rect.height = terrains[count_terrain].terrain.terrainData.size.z;
	}
	if (slice_tool && slice_tool_terrain)
	{
		slice_tool_rect.x = slice_tool_terrain.transform.position.x;
	    slice_tool_rect.y = slice_tool_terrain.transform.position.z;
	    slice_tool_rect.width = slice_tool_terrain.terrainData.size.x;
	    slice_tool_rect.height = slice_tool_terrain.terrainData.size.z;
	}
}

function set_basemap_max(editor: boolean)
{
	if (terrains.Count > 1)
	{
		if (editor){settings.editor_basemap_distance_max = terrains[0].tiles.x * terrains[0].size.x;}
			else {settings.runtime_basemap_distance_max = terrains[0].tiles.x * terrains[0].size.x;}
	}
	else
	{
		if (editor){settings.editor_basemap_distance_max = terrains[0].size.x;}
			else {settings.runtime_basemap_distance_max = terrains[0].size.x;}
	}
}

function get_all_terrain_settings(command: String)
{
	for (var count_terrain: int = 0;count_terrain < terrains.Count;++count_terrain)
	{
		get_terrain_settings(terrains[count_terrain],command);
	}	
}

function get_terrain_settings(preterrain1: terrain_class,command: String)
{
	if (preterrain1.terrain)
	{
		if (!preterrain1.terrain.terrainData){return;}
		var command_size: boolean = false;
		var command_resolutions: boolean = false;
		var command_conversions: boolean = false;
		var command_all: boolean = false;
		var command_first: boolean = false;
		var command_splat: boolean = false;
		var command_trees: boolean = false;
		var command_grass: boolean = false;
		
		if (command.IndexOf("(siz)") != -1){command_size = true;}
		if (command.IndexOf("(res)") != -1){command_resolutions = true;}
		if (command.IndexOf("(con)") != -1){command_conversions = true;}
		if (command.IndexOf("(all)") != -1){command_all = true;}
		if (command.IndexOf("(fir)") != -1){command_first = true;}
		if (command.IndexOf("(spl)") != -1){command_splat = true;}
		if (command.IndexOf("(tre)") != -1){command_trees = true;}
		if (command.IndexOf("(gra)") != -1){command_grass = true;}
		
		preterrain1.splat_length = preterrain1.terrain.terrainData.splatPrototypes.Length;
		preterrain1.name = preterrain1.terrain.name;
		
		if (command_size || command_all)
		{
			preterrain1.size = preterrain1.terrain.terrainData.size;
			// set_basemap_max();
			check_synchronous_terrain_size(preterrain1);
			
			preterrain1.scale.x = preterrain1.size.x/preterrain1.terrain.terrainData.heightmapResolution;
			preterrain1.scale.y = preterrain1.size.y/preterrain1.terrain.terrainData.heightmapResolution;
			preterrain1.scale.z = preterrain1.size.z/preterrain1.terrain.terrainData.heightmapResolution;
		}
		if (command_resolutions || command_all)
		{
			preterrain1.heightmap_resolution = preterrain1.terrain.terrainData.heightmapResolution;
			preterrain1.splatmap_resolution = preterrain1.terrain.terrainData.alphamapResolution;
			preterrain1.detail_resolution = preterrain1.terrain.terrainData.detailResolution;
			preterrain1.basemap_resolution = preterrain1.terrain.terrainData.baseMapResolution;
			get_terrain_resolution_to_list(preterrain1);
			check_synchronous_terrain_resolutions(preterrain1);
		}
		if (command_conversions || command_all)
		{	
			preterrain1.heightmap_conversion.x = preterrain1.terrain.terrainData.size.x/(preterrain1.terrain.terrainData.heightmapResolution-1);
			preterrain1.heightmap_conversion.y = preterrain1.terrain.terrainData.size.z/(preterrain1.terrain.terrainData.heightmapResolution-1);
		
			preterrain1.splatmap_conversion.x = preterrain1.terrain.terrainData.size.x/(preterrain1.terrain.terrainData.alphamapResolution-1);
			preterrain1.splatmap_conversion.y = preterrain1.terrain.terrainData.size.z/(preterrain1.terrain.terrainData.alphamapResolution-1);
		
			preterrain1.detailmap_conversion.x = preterrain1.terrain.terrainData.size.x/(preterrain1.terrain.terrainData.detailResolution-1);
			preterrain1.detailmap_conversion.y = preterrain1.terrain.terrainData.size.z/(preterrain1.terrain.terrainData.detailResolution-1);
			
			set_area_resolution(preterrain1,preterrain1.prearea);
    	}
		
		if (command_first) 
		{
			if (settings.triplanar)
			{
				var terrain_object: GameObject = preterrain1.terrain.gameObject;
				preterrain1.script_triplanar = terrain_object.GetComponent(TriPlanarTerrainScript);
			}
			preterrain1.prearea.area_max = Rect(0,0,preterrain1.terrain.terrainData.size.x,preterrain1.terrain.terrainData.size.z);
			preterrain1.prearea.area = preterrain1.prearea.area_max;
			preterrain1.prearea.set_resolution_mode_text();
			get_terrain_parameter_settings(preterrain1);
		}
		
		if (command_size || command_all || command_conversions || command_resolutions || command_first)
		{
			set_area_resolution(preterrain1,preterrain1.prearea);
			set_area_resolution_prelayers(preterrain1);
		}
		
		if (preterrain1.prearea.area.xMax > preterrain1.terrain.terrainData.size.x){preterrain1.prearea.area.xMax = preterrain1.terrain.terrainData.size.x;}
		if (preterrain1.prearea.area.yMax > preterrain1.terrain.terrainData.size.y){preterrain1.prearea.area.yMax = preterrain1.terrain.terrainData.size.z;}
		
		if (command_splat || command_all){get_terrain_splat_textures(preterrain1);check_synchronous_terrain_splat_textures(preterrain1);}
		if (command_trees || command_all){get_terrain_trees(preterrain1);check_synchronous_terrain_trees(preterrain1);}
		if (command_grass || command_all){get_terrain_details(preterrain1);check_synchronous_terrain_detail(preterrain1);}
	}
}

function set_area_resolution_prelayers(preterrain1: terrain_class)
{
	for (var count_prelayer: int = 0;count_prelayer < prelayers.Count;++count_prelayer)
	{
		set_area_resolution(preterrain1,prelayers[count_prelayer].prearea);
	}
}

function set_area_resolution(preterrain1: terrain_class,prearea: area_class)
{
	if (!preterrain1.terrain){return;}
	if (!preterrain1.terrain.terrainData){return;}
	
	if (prearea.resolution_mode == resolution_mode_enum.Heightmap)
	{
		prearea.step.x = preterrain1.terrain.terrainData.size.x/(preterrain1.terrain.terrainData.heightmapResolution-1);
		prearea.step.y = preterrain1.terrain.terrainData.size.z/(preterrain1.terrain.terrainData.heightmapResolution-1);
		prearea.conversion_step = prearea.step;
		prearea.resolution = preterrain1.heightmap_resolution;
	}
	else if (prearea.resolution_mode == resolution_mode_enum.Splatmap)
	{
		prearea.step.x = preterrain1.terrain.terrainData.size.x/(preterrain1.terrain.terrainData.alphamapResolution);
		prearea.step.y = preterrain1.terrain.terrainData.size.z/(preterrain1.terrain.terrainData.alphamapResolution);
		prearea.conversion_step = prearea.step;
		prearea.resolution = preterrain1.splatmap_resolution;
	}
	else if (prearea.resolution_mode == resolution_mode_enum.Detailmap)
	{
		prearea.step.x = preterrain1.terrain.terrainData.size.x/(preterrain1.terrain.terrainData.detailResolution);
		prearea.step.y = preterrain1.terrain.terrainData.size.z/(preterrain1.terrain.terrainData.detailResolution);
		prearea.conversion_step = prearea.step;
		prearea.resolution = preterrain1.detail_resolution;
	}
	else if (prearea.resolution_mode == resolution_mode_enum.Tree)
	{
		prearea.step.x = preterrain1.terrain.terrainData.size.x/(prearea.tree_resolution);
		prearea.step.y = preterrain1.terrain.terrainData.size.z/(prearea.tree_resolution);
		prearea.conversion_step = prearea.step;
		prearea.resolution = prearea.tree_resolution;
	}
	else if (prearea.resolution_mode == resolution_mode_enum.Object)
	{
		prearea.step.x = preterrain1.terrain.terrainData.size.x/(prearea.object_resolution);
		prearea.step.y = preterrain1.terrain.terrainData.size.z/(prearea.object_resolution);
		prearea.conversion_step = prearea.step;
		prearea.resolution = prearea.object_resolution;
	}
	else if (prearea.resolution_mode == resolution_mode_enum.Units)
	{
		prearea.step.x = 1;
		prearea.step.y = 1;
		prearea.conversion_step = prearea.step;
		prearea.resolution = preterrain1.terrain.terrainData.size.x;
	}
	else if (prearea.resolution_mode == resolution_mode_enum.Custom)
	{
		prearea.resolution = preterrain1.terrain.terrainData.size.x/prearea.step.x;
		prearea.conversion_step = prearea.step;
	}	
}

function get_terrain_parameter_settings(preterrain1: terrain_class)
{
	for (var count_terrain: int = 0;count_terrain < terrains.Count;++count_terrain)
	{
		terrains[count_terrain].settings_editor = preterrain1.settings_editor;
		terrains[count_terrain].settings_runtime = preterrain1.settings_runtime;
		
		if (!terrains[count_terrain].terrain){continue;}
		if (!terrains[count_terrain].terrain.terrainData){continue;}
		if (terrains[count_terrain].settings_editor)
		{
			terrains[count_terrain].heightmapPixelError = terrains[count_terrain].terrain.heightmapPixelError;
			terrains[count_terrain].heightmapMaximumLOD = terrains[count_terrain].terrain.heightmapMaximumLOD;
			terrains[count_terrain].basemapDistance = terrains[count_terrain].terrain.basemapDistance;
			terrains[count_terrain].castShadows = terrains[count_terrain].terrain.castShadows;
			terrains[count_terrain].draw = terrains[count_terrain].editor_draw;
			terrains[count_terrain].treeDistance = terrains[count_terrain].terrain.treeDistance;
			terrains[count_terrain].detailObjectDistance = terrains[count_terrain].terrain.detailObjectDistance;
			terrains[count_terrain].detailObjectDensity = terrains[count_terrain].terrain.detailObjectDensity;
			terrains[count_terrain].treeBillboardDistance = terrains[count_terrain].terrain.treeBillboardDistance;
			terrains[count_terrain].treeCrossFadeLength = terrains[count_terrain].terrain.treeCrossFadeLength;
			terrains[count_terrain].treeMaximumFullLODCount = terrains[count_terrain].terrain.treeMaximumFullLODCount;
		}
		else
		{
			terrains[count_terrain].script_terrainDetail = terrains[count_terrain].terrain.gameObject.GetComponent(TerrainDetail);
			
			if (!terrains[count_terrain].script_terrainDetail)
			{
				terrains[count_terrain].script_terrainDetail = terrains[count_terrain].terrain.gameObject.AddComponent(TerrainDetail);
			}
			
			terrains[count_terrain].heightmapPixelError = terrains[count_terrain].script_terrainDetail.heightmapPixelError;
			terrains[count_terrain].heightmapMaximumLOD = terrains[count_terrain].script_terrainDetail.heightmapMaximumLOD;
			terrains[count_terrain].basemapDistance = terrains[count_terrain].script_terrainDetail.basemapDistance;
			terrains[count_terrain].castShadows = terrains[count_terrain].script_terrainDetail.castShadows;
			terrains[count_terrain].draw = terrains[count_terrain].script_terrainDetail.draw;
			terrains[count_terrain].treeDistance = terrains[count_terrain].script_terrainDetail.treeDistance;
			terrains[count_terrain].detailObjectDistance = terrains[count_terrain].script_terrainDetail.detailObjectDistance;
			terrains[count_terrain].detailObjectDensity = terrains[count_terrain].script_terrainDetail.detailObjectDensity;
			terrains[count_terrain].treeBillboardDistance = terrains[count_terrain].script_terrainDetail.treeBillboardDistance;
			terrains[count_terrain].treeCrossFadeLength = terrains[count_terrain].script_terrainDetail.treeCrossFadeLength;
			terrains[count_terrain].treeMaximumFullLODCount = terrains[count_terrain].script_terrainDetail.treeMaximumFullLODCount;
		}
	}
}

function set_terrain_parameters(preterrain1: terrain_class)
{
	preterrain1.terrain.heightmapPixelError = preterrain1.heightmapPixelError;
	preterrain1.terrain.heightmapMaximumLOD = preterrain1.heightmapMaximumLOD;
	preterrain1.terrain.basemapDistance = preterrain1.basemapDistance;
	preterrain1.terrain.castShadows = preterrain1.castShadows;
	preterrain1.terrain.treeDistance = preterrain1.treeDistance;
	preterrain1.terrain.detailObjectDistance = preterrain1.detailObjectDistance;
	preterrain1.terrain.detailObjectDensity = preterrain1.detailObjectDensity;
	preterrain1.terrain.treeBillboardDistance = preterrain1.treeBillboardDistance;
	preterrain1.terrain.treeCrossFadeLength = preterrain1.treeCrossFadeLength;
	preterrain1.terrain.treeMaximumFullLODCount = preterrain1.treeMaximumFullLODCount;
}

function set_terrain_pixelerror(preterrain1: terrain_class,all_terrain: boolean)
{
	if (!all_terrain)
	{
		if (preterrain1.terrain)
		{
			if (preterrain1.settings_editor){preterrain1.terrain.heightmapPixelError = preterrain1.heightmapPixelError;}
				else {preterrain1.script_terrainDetail.heightmapPixelError = preterrain1.heightmapPixelError;}
		}
	}
	else
	{
		for (var count_terrain: int = 0;count_terrain < terrains.Count;++count_terrain)
		{
			if (terrains[count_terrain].terrain)
			{
				terrains[count_terrain].heightmapPixelError = preterrain1.heightmapPixelError;
				
				if (preterrain1.settings_editor)
				{
					terrains[count_terrain].terrain.heightmapPixelError = preterrain1.heightmapPixelError;	
				}
				else
				{
					terrains[count_terrain].script_terrainDetail.heightmapPixelError = preterrain1.heightmapPixelError;
				}
			}
		}	
	}
}

function set_terrain_heightmap_lod(preterrain1: terrain_class,all_terrain: boolean)
{
	if (!all_terrain)
	{
		if (preterrain1.terrain)
		{
			if (preterrain1.settings_editor){preterrain1.terrain.heightmapMaximumLOD = preterrain1.heightmapMaximumLOD;}
				else {preterrain1.script_terrainDetail.heightmapMaximumLOD = preterrain1.heightmapMaximumLOD;}
		}
	}
	else
	{
		for (var count_terrain: int = 0;count_terrain < terrains.Count;++count_terrain)
		{
			if (terrains[count_terrain].terrain)
			{
				terrains[count_terrain].heightmapMaximumLOD = preterrain1.heightmapMaximumLOD;
				
				if (preterrain1.settings_editor)
				{
					terrains[count_terrain].terrain.heightmapMaximumLOD = preterrain1.heightmapMaximumLOD;	
				}
				else
				{
					terrains[count_terrain].script_terrainDetail.heightmapMaximumLOD = preterrain1.heightmapMaximumLOD;
				}
			}
		}	
	}
}

function set_terrain_draw(preterrain1: terrain_class,all_terrain: boolean,draw: boolean)
{
	if (!all_terrain)
	{
		if (preterrain1.terrain)
		{
			if (draw)
			{
				if (preterrain1.settings_editor)
				{
					preterrain1.terrain.detailObjectDistance = preterrain1.detailObjectDistance;
					preterrain1.terrain.treeDistance = preterrain1.treeDistance;
					preterrain1.editor_draw = true;
				}
				else
				{
					preterrain1.script_terrainDetail.draw = true;
				}
			}
			else
			{
				if (preterrain1.settings_editor)
				{
					preterrain1.terrain.detailObjectDistance = 0;
					preterrain1.terrain.treeDistance = 0;
					preterrain1.editor_draw = false;
				}
				else 
				{
					preterrain1.script_terrainDetail.draw = false;
				}
			}
		}
	}
	else
	{
		for (var count_terrain: int = 0;count_terrain < terrains.Count;++count_terrain)
		{
			if (terrains[count_terrain].terrain)
			{
				if (draw)
				{
					if (preterrain1.settings_editor)
					{
						terrains[count_terrain].terrain.detailObjectDistance = preterrain1.detailObjectDistance;	
						terrains[count_terrain].terrain.treeDistance = preterrain1.treeDistance;
						terrains[count_terrain].editor_draw = true;
					}
					else
					{
						terrains[count_terrain].script_terrainDetail.draw = true;
					}
				}
				else
				{
					if (preterrain1.settings_editor)
					{	
						terrains[count_terrain].terrain.detailObjectDistance = 0;
						terrains[count_terrain].terrain.treeDistance = 0;
						terrains[count_terrain].editor_draw = false;
					}
					else
					{
						terrains[count_terrain].script_terrainDetail.draw = false;
					}
				}
			}
		}	
	}

}

function set_terrain_basemap_distance(preterrain1: terrain_class,all_terrain: boolean)
{
	if (!all_terrain)
	{
		if (preterrain1.terrain)
		{
			if (preterrain1.settings_editor){preterrain1.terrain.basemapDistance = preterrain1.basemapDistance;}
				else {preterrain1.script_terrainDetail.basemapDistance = preterrain1.basemapDistance;}
		}
	}
	else
	{
		for (var count_terrain: int = 0;count_terrain < terrains.Count;++count_terrain)
		{
			if (terrains[count_terrain].terrain)
			{
				terrains[count_terrain].basemapDistance = preterrain1.basemapDistance;
				
				if (preterrain1.settings_editor)
				{
					terrains[count_terrain].terrain.basemapDistance = preterrain1.basemapDistance;	
				}
				else
				{
					terrains[count_terrain].script_terrainDetail.basemapDistance = preterrain1.basemapDistance;
				}
			}
		}	
	}
}

function set_terrain_detail_distance(preterrain1: terrain_class,all_terrain: boolean)
{
	if (!all_terrain)
	{
		if (preterrain1.terrain)
		{
			if (preterrain1.settings_editor)
			{
				preterrain1.terrain.detailObjectDistance = preterrain1.detailObjectDistance;
			}
			else
			{
				preterrain1.script_terrainDetail.detailObjectDistance = preterrain1.detailObjectDistance;
			}
		}
	}
	else
	{
		for (var count_terrain: int = 0;count_terrain < terrains.Count;++count_terrain)
		{
			terrains[count_terrain].detailObjectDistance = preterrain1.detailObjectDistance;
			
			if (terrains[count_terrain].terrain)
			{
				if (preterrain1.settings_editor)
				{
					terrains[count_terrain].terrain.detailObjectDistance = preterrain1.detailObjectDistance;	
				}
				else
				{
					terrains[count_terrain].script_terrainDetail.detailObjectDistance = preterrain1.detailObjectDistance;
				}
			}
		}	
	}
}

function set_terrain_detail_density(preterrain1: terrain_class,all_terrain: boolean)
{
	if (!all_terrain)
	{
		if (preterrain1.terrain)
		{
			if (preterrain1.settings_editor)
			{
				preterrain1.terrain.detailObjectDensity = preterrain1.detailObjectDensity;
			}
			else
			{
				preterrain1.script_terrainDetail.detailObjectDensity = preterrain1.detailObjectDensity;
			}
		}
	}
	else
	{
		for (var count_terrain: int = 0;count_terrain < terrains.Count;++count_terrain)
		{
			if (terrains[count_terrain].terrain)
			{
				terrains[count_terrain].detailObjectDensity = preterrain1.detailObjectDensity;
				if (preterrain1.settings_editor)
				{
					terrains[count_terrain].terrain.detailObjectDensity = preterrain1.detailObjectDensity;	
				}
				else
				{
					terrains[count_terrain].script_terrainDetail.detailObjectDensity = preterrain1.detailObjectDensity;	
				}
			}
		}	
	}
}

function set_terrain_tree_distance(preterrain1: terrain_class,all_terrain: boolean)
{
	if (!all_terrain)
	{
		if (preterrain1.terrain)
		{
			if (preterrain1.settings_editor)
			{
				preterrain1.terrain.treeDistance = preterrain1.treeDistance;
			}
			else
			{
				preterrain1.script_terrainDetail.treeDistance = preterrain1.treeDistance;
			}
		}
	}
	else
	{
		for (var count_terrain: int = 0;count_terrain < terrains.Count;++count_terrain)
		{
			terrains[count_terrain].treeDistance = preterrain1.treeDistance;
			
			if (terrains[count_terrain].terrain)
			{
				if (preterrain1.settings_editor)
				{	
					terrains[count_terrain].terrain.treeDistance = preterrain1.treeDistance;	
				}
				else
				{
					terrains[count_terrain].script_terrainDetail.treeDistance = preterrain1.treeDistance;	
				}
			}
		}	
	}
}

function set_terrain_tree_billboard_distance(preterrain1: terrain_class,all_terrain: boolean)
{
	if (!all_terrain)
	{
		if (preterrain1.terrain)
		{
			if (preterrain1.settings_editor)
			{
				preterrain1.terrain.treeBillboardDistance = preterrain1.treeBillboardDistance;
			}
			else
			{
				preterrain1.script_terrainDetail.treeBillboardDistance = preterrain1.treeBillboardDistance;
			}
		}
	}
	else
	{
		for (var count_terrain: int = 0;count_terrain < terrains.Count;++count_terrain)
		{
			terrains[count_terrain].treeBillboardDistance = preterrain1.treeBillboardDistance;
			
			if (terrains[count_terrain].terrain)
			{
				if (preterrain1.settings_editor)
				{
					terrains[count_terrain].terrain.treeBillboardDistance = preterrain1.treeBillboardDistance;	
				}
				else
				{
					terrains[count_terrain].script_terrainDetail.treeBillboardDistance = preterrain1.treeBillboardDistance;		
				}
			}
		}	
	}
}

function set_terrain_tree_billboard_fade_length(preterrain1: terrain_class,all_terrain: boolean)
{
	if (!all_terrain)
	{
		if (preterrain1.terrain)
		{
			if (preterrain1.settings_editor)
			{
				preterrain1.terrain.treeCrossFadeLength = preterrain1.treeCrossFadeLength;
			}
			else
			{
				preterrain1.script_terrainDetail.treeCrossFadeLength = preterrain1.treeCrossFadeLength;
			}
		}
	}
	else
	{
		for (var count_terrain: int = 0;count_terrain < terrains.Count;++count_terrain)
		{
			if (terrains[count_terrain].terrain)
			{
				terrains[count_terrain].treeCrossFadeLength = preterrain1.treeCrossFadeLength;	
				
				if (preterrain1.settings_editor)
				{
					terrains[count_terrain].terrain.treeCrossFadeLength = preterrain1.treeCrossFadeLength;	
				}
				else
				{
					terrains[count_terrain].script_terrainDetail.treeCrossFadeLength = preterrain1.treeCrossFadeLength;
				}
			}
		}	
	}
}

function set_terrain_tree_max_mesh(preterrain1: terrain_class,all_terrain: boolean)
{
	if (!all_terrain)
	{
		if (preterrain1.terrain)
		{
			if (preterrain1.settings_editor)
			{
				preterrain1.terrain.treeMaximumFullLODCount = preterrain1.treeMaximumFullLODCount;
			}
			else
			{
				preterrain1.script_terrainDetail.treeMaximumFullLODCount = preterrain1.treeMaximumFullLODCount;
			}
		}
	}
	else
	{
		for (var count_terrain: int = 0;count_terrain < terrains.Count;++count_terrain)
		{
			terrains[count_terrain].treeMaximumFullLODCount = preterrain1.treeMaximumFullLODCount;
			
			if (terrains[count_terrain].terrain)
			{
				if (preterrain1.settings_editor)
				{
					terrains[count_terrain].terrain.treeMaximumFullLODCount = preterrain1.treeMaximumFullLODCount;	
				}
				else
				{
					terrains[count_terrain].script_terrainDetail.treeMaximumFullLODCount = preterrain1.treeMaximumFullLODCount;	
				}
			}
		}	
	}
}

function set_terrain_shadow(preterrain1: terrain_class,all_terrain: boolean)
{
	if (!all_terrain)
	{
		if (preterrain1.terrain)
		{
			if (preterrain1.settings_editor)
			{
				preterrain1.terrain.castShadows = preterrain1.castShadows;
			}
			else
			{
				preterrain1.script_terrainDetail.castShadows = preterrain1.castShadows;
			}
		}
	}
	else
	{
		for (var count_terrain: int = 0;count_terrain < terrains.Count;++count_terrain)
		{
			terrains[count_terrain].castShadows = preterrain1.castShadows;	
			
			if (terrains[count_terrain].terrain)
			{
				if (preterrain1.settings_editor)
				{
					terrains[count_terrain].terrain.castShadows = preterrain1.castShadows;	
				}
				else
				{
					terrains[count_terrain].script_terrainDetail.castShadows = preterrain1.castShadows;	
				}
			}
		}	
	}
}

function set_terrain_wind_speed(preterrain1: terrain_class,all_terrain: boolean)
{
	if (!all_terrain)
	{
		if (preterrain1.terrain)
		{
			preterrain1.terrain.terrainData.wavingGrassSpeed = preterrain1.wavingGrassSpeed;
			return;
		}
	}
	else
	{
		for (var count_terrain: int = 0;count_terrain < terrains.Count;++count_terrain)
		{
			if (terrains[count_terrain].terrain)
			{
				terrains[count_terrain].terrain.terrainData.wavingGrassSpeed = preterrain1.wavingGrassSpeed;	
				terrains[count_terrain].wavingGrassSpeed = preterrain1.wavingGrassSpeed;
			}
		}	
	}
}

function set_terrain_wind_amount(preterrain1: terrain_class,all_terrain: boolean)
{
	if (!all_terrain)
	{
		if (preterrain1.terrain)
		{
			preterrain1.terrain.terrainData.wavingGrassAmount = preterrain1.wavingGrassAmount;
			return;
		}
	}
	else
	{
		for (var count_terrain: int = 0;count_terrain < terrains.Count;++count_terrain)
		{
			if (terrains[count_terrain].terrain)
			{
				terrains[count_terrain].terrain.terrainData.wavingGrassAmount = preterrain1.wavingGrassAmount;	
				terrains[count_terrain].wavingGrassAmount = preterrain1.wavingGrassAmount;	
			}
		}	
	}
}

function set_terrain_wind_bending(preterrain1: terrain_class,all_terrain: boolean)
{
	if (!all_terrain)
	{
		if (preterrain1.terrain)
		{
			preterrain1.terrain.terrainData.wavingGrassStrength = preterrain1.wavingGrassStrength;
			return;
		}
	}
	else
	{
		for (var count_terrain: int = 0;count_terrain < terrains.Count;++count_terrain)
		{
			if (terrains[count_terrain].terrain)
			{
				terrains[count_terrain].terrain.terrainData.wavingGrassStrength = preterrain1.wavingGrassStrength;
				terrains[count_terrain].wavingGrassStrength = preterrain1.wavingGrassStrength;		
			}
		}	
	}
}

function set_terrain_grass_tint(preterrain1: terrain_class,all_terrain: boolean)
{
	if (!all_terrain)
	{
		if (preterrain1.terrain)
		{
			preterrain1.terrain.terrainData.wavingGrassTint = preterrain1.wavingGrassTint;
			return;
		}
	}
	else
	{
		for (var count_terrain: int = 0;count_terrain < terrains.Count;++count_terrain)
		{
			if (terrains[count_terrain].terrain)
			{
				terrains[count_terrain].terrain.terrainData.wavingGrassTint = preterrain1.wavingGrassTint;	
				terrains[count_terrain].wavingGrassTint = preterrain1.wavingGrassTint;
			}
		}	
	}
}

function set_terrain_settings(preterrain1: terrain_class,command: String)
{
	if (preterrain1.terrain)
	{
		var command_size: boolean = false;
		var command_all: boolean = false;
		var command_resolutions: boolean = false;
		
		if (command.IndexOf("(siz)")){command_size = true;}
		if (command.IndexOf("(res)")){command_resolutions = true;}
		if (command.IndexOf("(all)")){command_all = true;}
		
		if (command_size || command_all)
		{
			var size_old: Vector3 = preterrain1.terrain.terrainData.size;
			
			if (preterrain1.terrain.terrainData.size != preterrain1.size)
			{
				preterrain1.terrain.terrainData.size = preterrain1.size;
				
				var size_factor: Vector2;
				size_factor.x = preterrain1.size.x/size_old.x;
				size_factor.y = preterrain1.size.z/size_old.z;
				preterrain1.prearea.area_max.xMin = 0;
				preterrain1.prearea.area_max.yMin = 0;
				preterrain1.prearea.area_max.xMax = preterrain1.terrain.terrainData.size.x;
				preterrain1.prearea.area_max.yMax = preterrain1.terrain.terrainData.size.z;
				preterrain1.prearea.area.xMin *= size_factor.x;
				preterrain1.prearea.area.xMax *= size_factor.x;
				preterrain1.prearea.area.yMin *= size_factor.y;
				preterrain1.prearea.area.yMax *= size_factor.y;
			}
		}
		
		if (command_resolutions || command_all)
		{
			if (preterrain1.terrain.terrainData.heightmapResolution != preterrain1.heightmap_resolution)
			{
				preterrain1.terrain.terrainData.heightmapResolution = preterrain1.heightmap_resolution;
				preterrain1.terrain.terrainData.size = preterrain1.size;
			}
			if (preterrain1.terrain.terrainData.alphamapResolution != preterrain1.splatmap_resolution){preterrain1.terrain.terrainData.alphamapResolution = preterrain1.splatmap_resolution;}
			if (preterrain1.terrain.terrainData.baseMapResolution != preterrain1.basemap_resolution){preterrain1.terrain.terrainData.baseMapResolution = preterrain1.basemap_resolution;}
			preterrain1.terrain.terrainData.SetDetailResolution(preterrain1.detail_resolution,preterrain1.detail_resolution_per_patch);
		}
		get_terrain_settings(preterrain1,"(con)"+command);
	}
}

function set_all_terrain_area(preterrain1: terrain_class)
{
	for (var count_terrain: int = 0;count_terrain < terrains.Count;++count_terrain)
	{
		terrains[count_terrain].prearea.resolution_mode = preterrain1.prearea.resolution_mode;
		terrains[count_terrain].prearea.area = preterrain1.prearea.area;
		terrains[count_terrain].prearea.step = preterrain1.prearea.step;
		terrains[count_terrain].prearea.tree_resolution = preterrain1.prearea.tree_resolution;
		terrains[count_terrain].prearea.object_resolution = preterrain1.prearea.object_resolution;
		terrains[count_terrain].prearea.tree_resolution_active = preterrain1.prearea.tree_resolution_active;
		terrains[count_terrain].prearea.object_resolution_active = preterrain1.prearea.object_resolution_active;
		terrains[count_terrain].prearea.set_resolution_mode_text();
		terrains[count_terrain].color_terrain = Color(0.5,1,0.5);
	}
}

function set_all_terrain_settings(preterrain1: terrain_class,command: String)
{
	var command_size: boolean = false;
	var command_resolution: boolean = false;
	
	if (command.IndexOf("(siz)") != -1){command_size = true;}
	if (command.IndexOf("(res)") != -1){command_resolution = true;}
	
	
	for (var count_terrain: int = 0;count_terrain < terrains.Count;++count_terrain)
	{
		if (command_size){terrains[count_terrain].size = preterrain1.size;}
		if (command_resolution)
		{
			terrains[count_terrain].heightmap_resolution = preterrain1.heightmap_resolution;
			terrains[count_terrain].splatmap_resolution = preterrain1.splatmap_resolution;
			terrains[count_terrain].detail_resolution = preterrain1.detail_resolution;
			terrains[count_terrain].basemap_resolution = preterrain1.basemap_resolution;
			terrains[count_terrain].detail_resolution_per_patch = preterrain1.detail_resolution_per_patch;
		}	
		terrains[count_terrain].color_terrain = Color(0.5,1,0.5);
		
		set_terrain_settings(terrains[count_terrain],command);
		get_terrain_settings(terrains[count_terrain],command);
	}
}

function terrain_apply(preterrain1: terrain_class)
{
	if (splat_output || color_output && !button_export)
	{
		for (var count_alpha: int = 0;count_alpha < preterrain1.splat_alpha.Length;++count_alpha)
		{
			preterrain1.splat_alpha[count_alpha].Apply();
		}
		
		preterrain1.terrain.terrainData.SetAlphamaps(0,0,preterrain1.terrain.terrainData.GetAlphamaps(0,0,1,1));
	}
	if (grass_output && !button_export)
	{
		for (var count_grass: int;count_grass < preterrain1.grass_detail.Length;++count_grass)
		{
			preterrain1.terrain.terrainData.SetDetailLayer(0,0,count_grass,preterrain1.grass_detail[count_grass].detail);
		}
	}
	if (heightmap_output && !button_export)
	{
		preterrain1.terrain.terrainData.SetHeights(0,0,preterrain1.heights);
		if (smooth_command){smooth_terrain(preterrain1,smooth_tool_layer_strength);}
	}
	if (tree_output)
	{
		preterrain1.terrain.terrainData.treeInstances = new TreeInstance[preterrain1.tree_instances.Count];
		preterrain1.terrain.terrainData.treeInstances = preterrain1.tree_instances.ToArray();
	}
}

function get_terrain_alpha(preterrain1: terrain_class,local_x: int,local_y: int,alpha_index: int): float
{
	var alpha_map: int = alpha_index/4;
	var alpha_color: Color = preterrain1.splat_alpha[alpha_map].GetPixel(local_x,local_y);

	return alpha_color[alpha_index-(alpha_map*4)];
}

function set_all_tree_filters(tree_output: tree_output_class,tree_number: int,all: boolean)
{
	for (var count_tree: int = 0;count_tree < tree_output.tree.Count;++count_tree)
	{
		if (tree_output.tree_value.active[count_tree] || all)
		{
			if (count_tree != tree_number)
			{
				erase_filters(tree_output.tree[count_tree].prefilter);
				tree_output.tree[count_tree].prefilter = copy_prefilter(tree_output.tree[tree_number].prefilter);
			}		
			if (tree_output.tree[count_tree].color_tree[0] < 1.5){tree_output.tree[count_tree].color_tree += Color(0.5,0.5,0.5,0.5);}
		}
	}
}

function set_all_tree_precolor_range(tree_output: tree_output_class,tree_number: int,all: boolean)
{
	for (var count_tree: int = 0;count_tree < tree_output.tree.Count;++count_tree)
	{
		if (tree_output.tree_value.active[count_tree] || all)
		{
			if (count_tree != tree_number)
			{
				tree_output.tree[count_tree].precolor_range = copy_precolor_range(tree_output.tree[tree_number].precolor_range);
			}
			if (tree_output.tree[count_tree].color_tree[0] < 1.5){tree_output.tree[count_tree].color_tree += Color(0.5,0.5,0.5,0.5);}
		}
	}
}

function set_auto_object(object_output: object_output_class): boolean
{
	if (!object_output.search_object){return false;}
	var objects: Transform[] = object_output.search_object.GetComponentsInChildren.<Transform>();
	var name_old: String;
	
	add_object(object_output,object_output.object.Count);
	object_output.object[object_output.object.Count-1].object1 = objects[1].gameObject;
	name_old = objects[1].name;
	
	for (var count_object: int = 2;count_object < objects.Length;++count_object)
	{
		if (objects[count_object].name != name_old)
		{
			add_object(object_output,object_output.object.Count);
			object_output.object[object_output.object.Count-1].object1 = objects[count_object].gameObject;
			name_old = objects[count_object].name;
		}
		else if (object_output.search_erase_doubles){DestroyImmediate(objects[count_object].gameObject);}
	}
	return true;
}

function create_terrain(preterrain1: terrain_class,length: int,name_number: int)
{
	for (var count_terrain: int = 0;count_terrain < length;++count_terrain)
	{
	    var terrainData: TerrainData = new TerrainData();
			
		terrainData.heightmapResolution = preterrain1.heightmap_resolution;
		terrainData.baseMapResolution = preterrain1.basemap_resolution;
		terrainData.alphamapResolution = preterrain1.splatmap_resolution;
		terrainData.SetDetailResolution(preterrain1.detail_resolution,preterrain1.detail_resolution_per_patch);
		if (preterrain1.size.x == 0){preterrain1.size.x = 1000;}
		if (preterrain1.size.z == 0){preterrain1.size.z = 1000;}
	    terrainData.size = preterrain1.size;
    
	    var object: GameObject = Terrain.CreateTerrainGameObject(terrainData);
	    if (preterrain1.parent){object.transform.parent = preterrain1.parent;}
	   
	    var terrain: Terrain = object.GetComponent(Terrain);
	    // var script_collider: TerrainCollider = object.AddComponent(TerrainCollider);
	    terrain.name = terrain_scene_name+(count_terrain+name_number);
	    // terrain.terrainData = terrainDatas[terrainDatas.Count-1];
	    // var path: String = script.terrain_path;
	    //path = "Assets"+path.Replace(Application.dataPath,String.Empty);
	    // path += "/"+script.terrain_asset_name+(count_terrain+name_number)+".asset";
		// AssetDatabase.CreateAsset(terrainData,path);
	    // script_collider.terrainData = terrainData;
	    if (terrains.Count < count_terrain+name_number){set_terrain_length(terrains.Count+1);}
	    terrains[count_terrain+name_number-1].terrain = terrain;
	    set_terrain_parameters(terrains[count_terrain+name_number-1]);
	    get_terrain_settings(terrains[count_terrain+name_number-1],"(res)(con)(fir)");
	    terrains[count_terrain+name_number-1].tile_x = 0;
	    terrains[count_terrain+name_number-1].tile_z = 0;
	    terrains[count_terrain+name_number-1].tiles = Vector2(1,1);
	    terrains[count_terrain+name_number-1].terrain.transform.position = Vector3(-preterrain1.size.x/2,0,-preterrain1.size.z/2);
	    terrains[count_terrain+name_number-1].prearea.max();
	}
	set_all_terrain_splat_textures(preterrain1,true,true);
	set_all_terrain_trees(preterrain1);
	set_all_terrain_details(preterrain1);
}

function set_auto_terrain()
{
	var terrains2: Terrain[] = FindObjectsOfType(Terrain);
	var terrains3: List.<Terrain> = new List.<Terrain>();
	
	if (terrains2.Length > 0)
	{
		terrains.Clear();
		var list: List.<int> = new List.<int>();
		var count_terrain: int;
		
		for (count_terrain = 0;count_terrain < terrains2.Length;++count_terrain)
		{
			var name: String = terrains2[count_terrain].name;
			var numbersOnly: String = Regex.Replace(name, "[^0-9]", "");
 		
 			var number: float = 0;
 			if (Single.TryParse(numbersOnly,number))
 			{
 				list.Add(number);
 				terrains3.Add(terrains2[count_terrain]);
 				terrains.Add(new terrain_class());
 			} 
 		}
		
		if (list.Count > 0)
		{
			for (count_terrain = 0;count_terrain < list.Count;++count_terrain)
			{
				var pos: int = get_rank_in_list(list,count_terrain);
				terrains[pos].terrain = terrains3[count_terrain];
				terrains[pos].name = terrains[pos].terrain.name;
				terrains[pos].index = pos;
				get_terrain_settings(terrains[pos],"(all)(fir)(spl)(tre)");
			}
		}
	}
	set_smooth_tool_terrain_popup();
	set_terrain_text();
}

function get_rank_in_list(list: List.<int>,number: int): int
{
	var rank: int = 0;
	for (var count: int = 0;count < list.Count;++count)
	{
		if (list[number] > list[count]){++rank;}
	}
	return rank;
}

function check_terrains_assigned(): boolean
{
	for (var count_terrain: int = 0;count_terrain < terrains.Count;++count_terrain)
	{
		if (!terrains[count_terrain].terrain){return false;}
		if (!terrains[count_terrain].terrain.terrainData){return false;}
	}
	return true;
}

function find_terrain(): boolean
{
	for (var count_terrain: int = prelayer.count_terrain;count_terrain < terrains.Count;++count_terrain)
	{
 		if (terrains[count_terrain].active){return true;}
 		++prelayer.count_terrain;
 	}
 	return false;
}

function center_terrain_position(preterrain1: terrain_class)
{
	if (!preterrain1.terrain){return;}
	if (!preterrain1.terrain.terrainData){return;}
	preterrain1.terrain.transform.position = Vector3(-preterrain1.terrain.terrainData.size.x/2,0,-preterrain1.terrain.terrainData.size.z/2);
}

function fit_terrain_tiles(preterrain1: terrain_class,refit: boolean): int
{
	if (terrains.Count < 2){center_terrain_position(terrains[0]);return 1;}
	
	if (!check_terrains_assigned()){return -2;}
	
	var size: Vector3 = preterrain1.size;
	
	var tiles_length: float = terrains.Count;
	var tile_size: float = Mathf.Round(Mathf.Sqrt(tiles_length));
	
	if (tile_size != Mathf.Sqrt(tiles_length))
	{
		reset_terrains_tiles(this);
		return -3;
	}
	
	set_all_terrain_settings(preterrain1,"(siz)");
	
	for (var count_x: float = 0;count_x < tile_size;++count_x)
	{
		for (var count_y: float = 0;count_y < tile_size;++count_y)
		{
			var index: float = (count_x*tile_size)+count_y;
			if (index < terrains.Count)
			{
				var pos: Vector3;
				var pos_tile: Vector3;
				if (tile_size == 2)
				{
					pos_tile.z = (tile_size-count_y-2);
					pos.z = pos_tile.z*size.z;
					
					pos_tile.x = (-tile_size+count_x+1);
					pos.x = pos_tile.x*size.x;
					pos.y = 0;
				}
				else 
				{	
					pos_tile.z = ((tile_size-(count_y*2)-2)/2);
					pos.z = pos_tile.z*size.z;
					pos_tile.x = ((-tile_size+(count_x*2))/2);
					pos.x = pos_tile.x*size.x;
					pos.y = 0;
				}
				
				if (refit){terrains[index].terrain.transform.position = pos;}
				terrains[index].tile_x = count_x;
				terrains[index].tile_z = (tile_size-count_y-1);
				terrains[index].tiles.x = tile_size;
				terrains[index].tiles.y = tile_size;
				terrains[index].color_terrain = Color(0.5,1,0.5);
			}
		}
	}
	// set_basemap_max();
	tile_resolution = tile_size*preterrain1.size.x;
	set_neighbor(1);
	return 1;
}

function set_neighbor(mode: int)
{
	var script_neighbor: TerrainNeighbors;
	var terrain_number: int;
	
	for (var count_terrain: int = 0;count_terrain < terrains.Count;++count_terrain)
	{
		if (terrains[count_terrain].terrain)
		{
			script_neighbor = terrains[count_terrain].terrain.GetComponent(TerrainNeighbors);
				
			if (mode == 1)
			{
				if (!script_neighbor){script_neighbor = terrains[count_terrain].terrain.gameObject.AddComponent(TerrainNeighbors);}
				
				script_neighbor.left = null;
				script_neighbor.top = null;
				script_neighbor.right = null;
				script_neighbor.bottom = null;
				
				terrain_number = search_tile(terrains[count_terrain].tile_x-1,terrains[count_terrain].tile_z);
				if (terrain_number != -1){script_neighbor.left = terrains[terrain_number].terrain;}
				terrain_number = search_tile(terrains[count_terrain].tile_x,terrains[count_terrain].tile_z+1);
				if (terrain_number != -1){script_neighbor.top = terrains[terrain_number].terrain;}
				terrain_number = search_tile(terrains[count_terrain].tile_x+1,terrains[count_terrain].tile_z);
				if (terrain_number != -1){script_neighbor.right = terrains[terrain_number].terrain;}
				terrain_number = search_tile(terrains[count_terrain].tile_x,terrains[count_terrain].tile_z-1);
				if (terrain_number != -1){script_neighbor.bottom = terrains[terrain_number].terrain;}
			}
			if (mode == -1)
			{
				if (script_neighbor)
				{
					DestroyImmediate(script_neighbor);
				}
			}
		}
	}
}

function set_detail_script(mode: int)
{
	var script_detail: TerrainDetail;
	
	for (var count_terrain: int = 0;count_terrain < terrains.Count;++count_terrain)
	{
		if (terrains[count_terrain].terrain)
		{
			script_detail = terrains[count_terrain].terrain.GetComponent(TerrainDetail);
			
			if (mode == 1)
			{	
				if (!script_detail){script_detail = terrains[count_terrain].terrain.gameObject.AddComponent(TerrainDetail);}
			}
			if (mode == -1)
			{
				if (script_detail)
				{
					DestroyImmediate(script_detail);
				}
			}
		}
	}
}

function search_tile(tile_x: int,tile_z: int): int
{
	if (tile_x > terrains[0].tiles.x-1 || tile_x < 0){return -1;}
	if (tile_z > terrains[0].tiles.y-1 || tile_z < 0){return -1;}
	
	for (var count_terrain: int = 0;count_terrain < terrains.Count;++count_terrain)
	{
		if (terrains[count_terrain].tile_x == tile_x && terrains[count_terrain].tile_z == tile_z){return count_terrain;}
	}
	return -1;
}

function set_all_trees_settings_terrain(preterrain1: terrain_class,tree_number: int)
{
	for (var count_tree: int = 0;count_tree < preterrain1.treePrototypes.Count;++count_tree)
	{
		preterrain1.treePrototypes[count_tree].bendFactor = preterrain1.treePrototypes[tree_number].bendFactor;
	}
	if (preterrain1.color_terrain[0] < 1.5){preterrain1.color_terrain += Color(0.5,1,0.5,0.5);}
}

function set_all_trees_settings_terrains(preterrain1: terrain_class,tree_number: int)
{
	for (var count_terrain: int = 0;count_terrain < terrains.Count;++count_terrain)
	{
		for (var count_tree: int = 0;count_tree < preterrain1.treePrototypes.Count;++count_tree)
		{
			terrains[count_terrain].treePrototypes[count_tree].bendFactor = preterrain1.treePrototypes[tree_number].bendFactor;
		}
		check_synchronous_terrain_trees(terrains[count_terrain]);
		if (terrains[count_terrain].color_terrain[0] < 1.5){terrains[count_terrain].color_terrain += Color(0.5,1,0.5,0.5);}
	}
}

function set_all_terrain_splat_textures(preterrain1: terrain_class,copy: boolean,flash: boolean)
{
	for (var count_terrain: int = 0;count_terrain < terrains.Count;++count_terrain)
	{
		if (terrains[count_terrain].terrain)
		{
			if (copy){set_terrain_splat_textures(preterrain1,terrains[count_terrain]);}
				else {set_terrain_splat_textures(terrains[count_terrain],terrains[count_terrain]);}
			get_terrain_splat_textures(terrains[count_terrain]);
			if (flash){if (terrains[count_terrain].color_terrain[0] < 1.5){terrains[count_terrain].color_terrain = Color(0.5,1,0.5);}}
		}
	}
}

function set_all_terrain_color_textures(flash: boolean)
{
	for (var count_terrain: int = 0;count_terrain < terrains.Count;++count_terrain)
	{
		set_terrain_color_textures(terrains[count_terrain]);
		// check_synchronous_terrain_splat_textures(terrains[count_terrain]);
		if (flash){if (terrains[count_terrain].color_terrain[0] < 1.5){terrains[count_terrain].color_terrain = Color(0.5,1,0.5);}}
	}
}

function set_terrain_color_textures(preterrain1: terrain_class)
{
	if (!preterrain1.terrain){return;}
	
	var splatPrototypes: List.<SplatPrototype> = new List.<SplatPrototype>();
	
	for (var count_splat: int = 0;count_splat < settings.color_splatPrototypes.Length;++count_splat)
	{
		splatPrototypes.Add(new SplatPrototype());
		if (settings.color_splatPrototypes[count_splat].texture)
		{
			splatPrototypes[count_splat].texture = settings.color_splatPrototypes[count_splat].texture;
			splatPrototypes[count_splat].tileSize = settings.color_splatPrototypes[count_splat].tileSize;
			splatPrototypes[count_splat].tileOffset = settings.color_splatPrototypes[count_splat].tileOffset;
		}
	}
	preterrain1.terrain.terrainData.splatPrototypes = splatPrototypes.ToArray();
}

function set_terrain_splat_textures(preterrain1: terrain_class,preterrain2: terrain_class)
{
	if (!preterrain1.terrain){return;}
	
	var splatPrototypes: List.<SplatPrototype> = new List.<SplatPrototype>();
	for (var count_splat: int = 0;count_splat < preterrain1.splatPrototypes.Count;++count_splat)
	{
		splatPrototypes.Add(new SplatPrototype());
		if (preterrain1.splatPrototypes[count_splat].texture)
		{
			if (settings.colormap && count_splat == 0)
			{
				splatPrototypes[count_splat].texture = preterrain2.splatPrototypes[count_splat].texture;
				splatPrototypes[count_splat].tileSize = preterrain2.splatPrototypes[count_splat].tileSize;
				splatPrototypes[count_splat].tileOffset = preterrain2.splatPrototypes[count_splat].tileOffset;
			}
			else
			{
				splatPrototypes[count_splat].texture = preterrain1.splatPrototypes[count_splat].texture;
				splatPrototypes[count_splat].tileSize = preterrain1.splatPrototypes[count_splat].tileSize;
				splatPrototypes[count_splat].tileOffset = preterrain1.splatPrototypes[count_splat].tileOffset;
			}
		}
		if (settings.triplanar)
		{
			if (!preterrain2.script_triplanar)
			{
				set_triplanar_script(preterrain2,1);
				triplanar_init(preterrain2);
			}
			if (settings.colormap && count_splat == 0)
			{
				preterrain2.script_triplanar.bumpTextures[count_splat] = preterrain2.splatPrototypes[count_splat].normal_texture;
				preterrain2.script_triplanar.specTextures[count_splat] = preterrain2.splatPrototypes[count_splat].specular_texture;
				preterrain2.script_triplanar.tilesPerMeter[count_splat] = preterrain2.splatPrototypes[count_splat].tileSize.x;
				preterrain2.script_triplanar.tilesPerMeterNormal[count_splat] = preterrain2.splatPrototypes[count_splat].normal_tileSize.x;
				preterrain2.script_triplanar.Strength[count_splat] = preterrain2.splatPrototypes[count_splat].strength;
				preterrain2.script_triplanar.StrengthSplat[count_splat] = preterrain2.splatPrototypes[count_splat].strength_splat;
				preterrain2.script_triplanar.setTerrainValues();
			}
			else
			{
				preterrain2.script_triplanar.bumpTextures[count_splat] = preterrain1.splatPrototypes[count_splat].normal_texture;
				preterrain2.script_triplanar.specTextures[count_splat] = preterrain1.splatPrototypes[count_splat].specular_texture;
				preterrain2.script_triplanar.tilesPerMeter[count_splat] = preterrain1.splatPrototypes[count_splat].tileSize.x;
				preterrain2.script_triplanar.tilesPerMeterNormal[count_splat] = preterrain1.splatPrototypes[count_splat].normal_tileSize.x;
				preterrain2.script_triplanar.Strength[count_splat] = preterrain1.splatPrototypes[count_splat].strength;
				preterrain2.script_triplanar.StrengthSplat[count_splat] = preterrain1.splatPrototypes[count_splat].strength_splat;
				preterrain2.script_triplanar.setTerrainValues();
			}
		 }
	}
	preterrain2.terrain.terrainData.splatPrototypes = splatPrototypes.ToArray();
}

function set_triplanar_script(preterrain1: terrain_class,mode: int)
{
	if (mode == 1)
	{
		var terrain_object: GameObject = preterrain1.terrain.gameObject;
		preterrain1.script_triplanar = terrain_object.AddComponent(TriPlanarTerrainScript);
	}
	else if (mode == -1)
	{
		
	}
}

function set_colormap(active: boolean)
{
	var count_terrain: int = 0;
	
	if (active)
	{
		var tileSize: float;
		for (count_terrain = 0;count_terrain < terrains.Count;++count_terrain)
		{
			terrains[count_terrain].add_splatprototype(0);	
			if (terrains[count_terrain].terrain){tileSize = terrains[count_terrain].terrain.terrainData.size.x;} else {tileSize = terrains[count_terrain].size.x;}
			
			terrains[count_terrain].colormap.tileSize = Vector2(tileSize,tileSize);
			terrains[count_terrain].splatPrototypes[0].texture = terrains[count_terrain].colormap.texture;
			terrains[count_terrain].splatPrototypes[0].tileSize = terrains[count_terrain].colormap.tileSize;
			terrains[count_terrain].splatPrototypes[0].tileOffset = terrains[count_terrain].colormap.tileOffset;
			if (terrains[count_terrain].splatPrototypes[0].texture)
			{
				set_terrain_splat_textures(terrains[count_terrain],terrains[count_terrain]);
			}
		}
	}
	else
	{
		for (count_terrain = 0;count_terrain < terrains.Count;++count_terrain)
		{
			terrains[count_terrain].colormap.texture = terrains[count_terrain].splatPrototypes[0].texture;
			terrains[count_terrain].erase_splatprototype(0);	
			set_terrain_splat_textures(terrains[count_terrain],terrains[count_terrain]);
		}
	}
	loop_colormap(active);
}

function loop_colormap(active: boolean)
{
	for (var count_prelayer: int = 0;count_prelayer < prelayers.Count;++count_prelayer)
	{
		for (var count_layer: int = 0;count_layer < prelayers[count_prelayer].layer.Count;++count_layer)
		{
			if (prelayers[count_prelayer].layer[count_layer].output == layer_output_enum.splat)
			{
				for (var count_splat: int = 0;count_splat < prelayers[count_prelayer].layer[count_layer].splat_output.splat.Count;++count_splat)
				{
					if (prelayers[count_prelayer].layer[count_layer].splat_output.splat[count_splat] == 0)
					{
						if (!active){prelayers[count_prelayer].layer[count_layer].splat_output.splat_value.active[count_splat] = false;}
							else 
							{
								prelayers[count_prelayer].layer[count_layer].splat_output.splat[count_splat] += 1;
								prelayers[count_prelayer].layer[count_layer].splat_output.splat_value.active[count_splat] = true;
							}
					}
					else
					{
						if (!active){prelayers[count_prelayer].layer[count_layer].splat_output.splat[count_splat] -= 1;}
							else {prelayers[count_prelayer].layer[count_layer].splat_output.splat[count_splat] += 1;}
					}
				}
			}
		}
	}
}

function triplanar_init(preterrain1: terrain_class)
{
	preterrain1.script_triplanar.TriPlanar = true;
	preterrain1.script_triplanar.tilesPerMeter = new float[8];
	preterrain1.script_triplanar.tilesPerMeterNormal = new float[8];
	preterrain1.script_triplanar.Strength = new float[8];
	preterrain1.script_triplanar.StrengthSplat = new float[8];
	
	preterrain1.script_triplanar.bumpTextures = new Texture2D[8];
	preterrain1.script_triplanar.specTextures = new Texture2D[8];
	
	preterrain1.script_triplanar.setTerrainValues();
	
	for (var count_splat: int = 0;count_splat < preterrain1.splatPrototypes.Count;++count_splat)
	{
		if (preterrain1.splatPrototypes[count_splat].normal_tileSize == Vector2(-1,-1)){preterrain1.splatPrototypes[count_splat].normal_tileSize = preterrain1.splatPrototypes[count_splat].tileSize;}
		if (preterrain1.splatPrototypes[count_splat].strength == -1){preterrain1.splatPrototypes[count_splat].strength = 1;}
		if (preterrain1.splatPrototypes[count_splat].strength_splat == -1){preterrain1.splatPrototypes[count_splat].strength_splat = 1;}
	}
}

function get_terrain_splat_textures(preterrain1: terrain_class)
{
	if (!preterrain1.terrain){return;}
	for (var count_splat: int = 0;count_splat < preterrain1.terrain.terrainData.splatPrototypes.Length;++count_splat)
	{
		if (preterrain1.splatPrototypes.Count-1 < count_splat){preterrain1.splatPrototypes.Add(new splatPrototype_class());}
		preterrain1.splatPrototypes[count_splat].texture = preterrain1.terrain.terrainData.splatPrototypes[count_splat].texture;
		preterrain1.splatPrototypes[count_splat].tileSize = preterrain1.terrain.terrainData.splatPrototypes[count_splat].tileSize;
		preterrain1.splatPrototypes[count_splat].tileOffset = preterrain1.terrain.terrainData.splatPrototypes[count_splat].tileOffset;
		
		if (settings.triplanar)
	 	{
	 		preterrain1.splatPrototypes[count_splat].normal_texture = preterrain1.script_triplanar.bumpTextures[count_splat];
	 		preterrain1.splatPrototypes[count_splat].specular_texture = preterrain1.script_triplanar.specTextures[count_splat];
	 		preterrain1.splatPrototypes[count_splat].tileSize.x = preterrain1.script_triplanar.tilesPerMeter[count_splat]; 
	 		preterrain1.splatPrototypes[count_splat].normal_tileSize.x = preterrain1.script_triplanar.tilesPerMeterNormal[count_splat];
	 		preterrain1.splatPrototypes[count_splat].strength = preterrain1.script_triplanar.Strength[count_splat];
	 		preterrain1.splatPrototypes[count_splat].strength_splat = preterrain1.script_triplanar.StrengthSplat[count_splat];
	 	}
	}
	
	var delta_splat: int = preterrain1.splatPrototypes.Count - preterrain1.terrain.terrainData.splatPrototypes.Length;
	
	for (count_splat = 0;count_splat < delta_splat;++count_splat)
	{
		preterrain1.splatPrototypes.RemoveAt(preterrain1.splatPrototypes.Count-1);		
	}
}

function check_synchronous_terrains_splat_textures()
{
	for (var count_terrain: int = 0;count_terrain < terrains.Count;++count_terrain)
	{
		check_synchronous_terrain_splat_textures(terrains[count_terrain]);
	}
}

function check_synchronous_terrain_splat_textures(preterrain1: terrain_class)
{
	if (!preterrain1.terrain){return;}
	if (!preterrain1.terrain.terrainData){return;}
	var synchronous: boolean = true;
	if (preterrain1.splatPrototypes.Count != preterrain1.terrain.terrainData.splatPrototypes.Length){synchronous = false;}
	else
	{
		for (var count_splat: int = 0;count_splat < preterrain1.splatPrototypes.Count;++count_splat)
		{
			if (preterrain1.splatPrototypes[count_splat].texture != preterrain1.terrain.terrainData.splatPrototypes[count_splat].texture){synchronous = false;break;}
			if (preterrain1.splatPrototypes[count_splat].tileOffset != preterrain1.terrain.terrainData.splatPrototypes[count_splat].tileOffset){synchronous = false;break;}
		}
	}
	preterrain1.splat_synchronous = synchronous;
}

function check_synchronous_terrains_color_textures()
{
	for (var count_terrain: int = 0;count_terrain < terrains.Count;++count_terrain)
	{
		check_synchronous_terrain_color_textures(terrains[count_terrain]);
	}
}

function check_synchronous_terrain_color_textures(preterrain1: terrain_class)
{
	if (!preterrain1.terrain){return;}
	if (!preterrain1.terrain.terrainData){return;}
	var synchronous: boolean = true;
	if (settings.color_splatPrototypes.Length != preterrain1.terrain.terrainData.splatPrototypes.Length){synchronous = false;}
	else
	{
		for (var count_splat: int = 0;count_splat < settings.color_splatPrototypes.Length;++count_splat)
		{
			if (settings.color_splatPrototypes[count_splat].texture != preterrain1.terrain.terrainData.splatPrototypes[count_splat].texture){synchronous = false;break;}
			// if (preterrain1.splatPrototypes[count_splat].tileOffset != preterrain1.terrain.terrainData.splatPrototypes[count_splat].tileOffset){synchronous = false;break;}
		}
	}
	preterrain1.splat_synchronous = synchronous;
}

function check_synchronous_terrain_size(preterrain1: terrain_class)
{
	if (!preterrain1.terrain){return;}
	if (!preterrain1.terrain.terrainData){return;}
	var synchronous: boolean = true;
	
	if (preterrain1.size.x != preterrain1.terrain.terrainData.size.x || preterrain1.size.y != preterrain1.terrain.terrainData.size.y || preterrain1.size.z != preterrain1.terrain.terrainData.size.z)
	{
		synchronous = false;
	}
	preterrain1.size_synchronous = synchronous;
}

function check_synchronous_terrain_resolutions(preterrain1: terrain_class)
{
	if (!preterrain1.terrain){return;}
	if (!preterrain1.terrain.terrainData){return;}
	var synchronous: boolean = true; 
	
	if (preterrain1.heightmap_resolution != preterrain1.terrain.terrainData.heightmapResolution || preterrain1.splatmap_resolution != preterrain1.terrain.terrainData.alphamapResolution || preterrain1.detail_resolution != preterrain1.terrain.terrainData.detailResolution || preterrain1.basemap_resolution != preterrain1.terrain.terrainData.baseMapResolution)
	{
		synchronous = false;
	}
	preterrain1.resolutions_synchronous = synchronous;
}

function copy_terrain_splat(splatPrototype1: splatPrototype_class,splatPrototype2: splatPrototype_class)
{
	splatPrototype2.texture = splatPrototype1.texture;
	splatPrototype2.tileSize_old = splatPrototype1.tileSize_old;
	splatPrototype2.tileOffset = splatPrototype1.tileOffset;
}

function copy_terrain_splats(preterrain1: terrain_class,preterrain2: terrain_class)
{
	for (var count_splat: int = 0;count_splat < preterrain1.splatPrototypes.Count;++count_splat)
	{
		if (preterrain2.splatPrototypes.Count < preterrain1.splatPrototypes.Count){preterrain2.splatPrototypes.Add(new splatPrototype_class());}
		copy_terrain_splat(preterrain1.splatPrototypes[count_splat],preterrain2.splatPrototypes[count_splat]);
	}
}

function swap_terrain_splat(preterrain1: terrain_class,splat_number1: int,splat_number2: int)
{
	if (splat_number2 > -1 && splat_number2 < preterrain1.splatPrototypes.Count)
	{
		var splatPrototype2: splatPrototype_class = preterrain1.splatPrototypes[splat_number1];
		
		preterrain1.splatPrototypes[splat_number1] = preterrain1.splatPrototypes[splat_number2];
		preterrain1.splatPrototypes[splat_number2] = splatPrototype2;
	}
}

function set_all_terrain_trees(preterrain1: terrain_class)
{
	set_terrain_trees(preterrain1);
	for (var count_terrain: int = 0;count_terrain < terrains.Count;++count_terrain)
	{
		if (terrains[count_terrain].terrain)
		{
			terrains[count_terrain].terrain.terrainData.treePrototypes = preterrain1.terrain.terrainData.treePrototypes;
			get_terrain_trees(terrains[count_terrain]);
			terrains[count_terrain].color_terrain = Color(0.5,1,0.5);
			check_synchronous_terrain_trees(terrains[count_terrain]);
		}
	}
}

function set_terrain_trees(preterrain1: terrain_class)
{
	var treePrototypes: List.<TreePrototype> = new List.<TreePrototype>();
	for (var count_tree: int = 0;count_tree < preterrain1.treePrototypes.Count;++count_tree)
	{
		if (preterrain1.treePrototypes[count_tree].prefab)
		{
			treePrototypes.Add(new TreePrototype());
			treePrototypes[count_tree].prefab = preterrain1.treePrototypes[count_tree].prefab;
			treePrototypes[count_tree].bendFactor = preterrain1.treePrototypes[count_tree].bendFactor;
		}
	}
	preterrain1.terrain.terrainData.treePrototypes = treePrototypes.ToArray();
}

function get_terrain_trees(preterrain1: terrain_class)
{
	preterrain1.treePrototypes.Clear();
	for (var count_tree: int = 0;count_tree < preterrain1.terrain.terrainData.treePrototypes.Length;++count_tree)
	{
		preterrain1.treePrototypes.Add(new treePrototype_class());
		preterrain1.treePrototypes[count_tree].prefab = preterrain1.terrain.terrainData.treePrototypes[count_tree].prefab;
		preterrain1.treePrototypes[count_tree].bendFactor = preterrain1.terrain.terrainData.treePrototypes[count_tree].bendFactor;
	}
}

function check_synchronous_terrain_trees(preterrain1: terrain_class)
{
	if (!preterrain1.terrain){return;}
	if (!preterrain1.terrain.terrainData){return;}
	var synchronous: boolean = true;
	
	if (preterrain1.treePrototypes.Count != preterrain1.terrain.terrainData.treePrototypes.Length){synchronous = false;}
	else
	{
		for (var count_tree: int = 0;count_tree < preterrain1.treePrototypes.Count;++count_tree)
		{
			if (preterrain1.treePrototypes[count_tree].prefab != preterrain1.terrain.terrainData.treePrototypes[count_tree].prefab){synchronous = false;break;}
			if (preterrain1.treePrototypes[count_tree].bendFactor != preterrain1.terrain.terrainData.treePrototypes[count_tree].bendFactor){synchronous = false;break;}
		}
	}
	preterrain1.tree_synchronous = synchronous;
}

function copy_terrain_tree(treePrototype1: treePrototype_class,treePrototype2: treePrototype_class)
{
	treePrototype2.prefab = treePrototype1.prefab;
	treePrototype2.bendFactor = treePrototype1.bendFactor;
} 

function copy_terrain_trees(preterrain1: terrain_class,preterrain2: terrain_class)
{
	for (var count_tree: int = 0;count_tree < preterrain1.treePrototypes.Count;++count_tree)
	{
		if (preterrain2.treePrototypes.Count < preterrain1.treePrototypes.Count){preterrain2.treePrototypes.Add(treePrototype_class());}
		copy_terrain_tree(preterrain1.treePrototypes[count_tree],preterrain2.treePrototypes[count_tree]);
	}
}

function swap_terrain_tree(preterrain1: terrain_class,tree_number1: int, tree_number2: int)
{
	if (tree_number2 > -1 && tree_number2 < preterrain1.treePrototypes.Count)
	{
		var treePrototype2: treePrototype_class = preterrain1.treePrototypes[tree_number1];
		
		preterrain1.treePrototypes[tree_number1] = preterrain1.treePrototypes[tree_number2];
		preterrain1.treePrototypes[tree_number2] = treePrototype2;
	}
}

function set_terrain_details(preterrain1: terrain_class)
{
	var detailPrototypes: List.<DetailPrototype> = new List.<DetailPrototype>();
	for (var count_detail: int = 0;count_detail < preterrain1.detailPrototypes.Count;++count_detail)
	{
		if (preterrain1.detailPrototypes[count_detail].prototype || preterrain1.detailPrototypes[count_detail].prototypeTexture)
		{
			detailPrototypes.Add(new DetailPrototype());
			detailPrototypes[count_detail].renderMode = preterrain1.detailPrototypes[count_detail].renderMode;
			detailPrototypes[count_detail].prototypeTexture = preterrain1.detailPrototypes[count_detail].prototypeTexture;
			
			detailPrototypes[count_detail].minWidth = preterrain1.detailPrototypes[count_detail].minWidth;
			detailPrototypes[count_detail].maxWidth = preterrain1.detailPrototypes[count_detail].maxWidth;
			detailPrototypes[count_detail].minHeight = preterrain1.detailPrototypes[count_detail].minHeight;
			detailPrototypes[count_detail].maxHeight = preterrain1.detailPrototypes[count_detail].maxHeight;
			detailPrototypes[count_detail].noiseSpread = preterrain1.detailPrototypes[count_detail].noiseSpread;
			detailPrototypes[count_detail].healthyColor = preterrain1.detailPrototypes[count_detail].healthyColor;
			detailPrototypes[count_detail].dryColor = preterrain1.detailPrototypes[count_detail].dryColor;
			detailPrototypes[count_detail].bendFactor = preterrain1.detailPrototypes[count_detail].bendFactor;
		}
	}
	preterrain1.terrain.terrainData.detailPrototypes = detailPrototypes.ToArray();
	preterrain1.detail_scale = 1;
}

function copy_terrain_detail(detailPrototype1: detailPrototype_class,detailPrototype2: detailPrototype_class)
{
	detailPrototype2.prototype = detailPrototype1.prototype;
	detailPrototype2.prototypeTexture = detailPrototype1.prototypeTexture;
	detailPrototype2.minWidth = detailPrototype1.minWidth;
	detailPrototype2.maxWidth = detailPrototype1.maxWidth;
	detailPrototype2.minHeight = detailPrototype1.minHeight;
	detailPrototype2.maxHeight = detailPrototype1.maxHeight;
	detailPrototype2.noiseSpread = detailPrototype1.noiseSpread;
	detailPrototype2.healthyColor = detailPrototype1.healthyColor;
	detailPrototype2.dryColor = detailPrototype1.dryColor;
	detailPrototype2.renderMode = detailPrototype1.renderMode;
	detailPrototype2.bendFactor = detailPrototype1.bendFactor;
}

function copy_terrain_details(preterrain1: terrain_class,preterrain2: terrain_class)
{
	for (var count_detail: int = 0;count_detail < preterrain1.detailPrototypes.Count;++count_detail)
	{
		if (preterrain2.detailPrototypes.Count < preterrain1.detailPrototypes.Count){preterrain2.detailPrototypes.Add(detailPrototype_class());}
		copy_terrain_detail(preterrain1.detailPrototypes[count_detail],preterrain2.detailPrototypes[count_detail]);
	}
}

function swap_terrain_detail(preterrain1: terrain_class,detail_number1: int,detail_number2: int)
{
	if (detail_number2 > -1 && detail_number2 < preterrain1.detailPrototypes.Count)
	{
		var detailPrototype2: detailPrototype_class = preterrain1.detailPrototypes[detail_number1];
		
		preterrain1.detailPrototypes[detail_number1] = preterrain1.detailPrototypes[detail_number2];
		preterrain1.detailPrototypes[detail_number2] = detailPrototype2;
	} 
}

function get_terrain_details(preterrain1: terrain_class)
{
	preterrain1.detailPrototypes.Clear();
	for (var count_detail: int = 0;count_detail < preterrain1.terrain.terrainData.detailPrototypes.Length;++count_detail)
	{
		preterrain1.detailPrototypes.Add(new detailPrototype_class());
		preterrain1.detailPrototypes[count_detail].prototype = preterrain1.terrain.terrainData.detailPrototypes[count_detail].prototype;
		preterrain1.detailPrototypes[count_detail].prototypeTexture = preterrain1.terrain.terrainData.detailPrototypes[count_detail].prototypeTexture;
		preterrain1.detailPrototypes[count_detail].minWidth = preterrain1.terrain.terrainData.detailPrototypes[count_detail].minWidth;
		preterrain1.detailPrototypes[count_detail].maxWidth = preterrain1.terrain.terrainData.detailPrototypes[count_detail].maxWidth;
		preterrain1.detailPrototypes[count_detail].minHeight = preterrain1.terrain.terrainData.detailPrototypes[count_detail].minHeight;
		preterrain1.detailPrototypes[count_detail].maxHeight = preterrain1.terrain.terrainData.detailPrototypes[count_detail].maxHeight;
		preterrain1.detailPrototypes[count_detail].noiseSpread = preterrain1.terrain.terrainData.detailPrototypes[count_detail].noiseSpread;
		preterrain1.detailPrototypes[count_detail].healthyColor = preterrain1.terrain.terrainData.detailPrototypes[count_detail].healthyColor;
		preterrain1.detailPrototypes[count_detail].dryColor = preterrain1.terrain.terrainData.detailPrototypes[count_detail].dryColor;
		preterrain1.detailPrototypes[count_detail].renderMode = preterrain1.terrain.terrainData.detailPrototypes[count_detail].renderMode;
		preterrain1.detailPrototypes[count_detail].bendFactor = preterrain1.terrain.terrainData.detailPrototypes[count_detail].bendFactor;
	}
}

function check_synchronous_terrain_detail(preterrain1: terrain_class)
{
	if (!preterrain1.terrain){return;}
	if (!preterrain1.terrain.terrainData){return;}
	var synchronous: boolean = true;
	
	if (preterrain1.detailPrototypes.Count != preterrain1.terrain.terrainData.detailPrototypes.Length){synchronous = false;}
	else
	{
		for (var count_detail: int = 0;count_detail < preterrain1.detailPrototypes.Count;++count_detail)
		{
			if (preterrain1.detailPrototypes[count_detail].prototype != preterrain1.terrain.terrainData.detailPrototypes[count_detail].prototype){synchronous = false;break;}
			if (preterrain1.detailPrototypes[count_detail].prototypeTexture != preterrain1.terrain.terrainData.detailPrototypes[count_detail].prototypeTexture){synchronous = false;break;}
			if (preterrain1.detailPrototypes[count_detail].minWidth != preterrain1.terrain.terrainData.detailPrototypes[count_detail].minWidth){synchronous = false;break;}
			if (preterrain1.detailPrototypes[count_detail].maxWidth != preterrain1.terrain.terrainData.detailPrototypes[count_detail].maxWidth){synchronous = false;break;}
			if (preterrain1.detailPrototypes[count_detail].minHeight != preterrain1.terrain.terrainData.detailPrototypes[count_detail].minHeight){synchronous = false;break;}
			if (preterrain1.detailPrototypes[count_detail].maxHeight != preterrain1.terrain.terrainData.detailPrototypes[count_detail].maxHeight){synchronous = false;break;}
			if (preterrain1.detailPrototypes[count_detail].noiseSpread != preterrain1.terrain.terrainData.detailPrototypes[count_detail].noiseSpread){synchronous = false;break;}
			if (preterrain1.detailPrototypes[count_detail].healthyColor != preterrain1.terrain.terrainData.detailPrototypes[count_detail].healthyColor){synchronous = false;break;}
			if (preterrain1.detailPrototypes[count_detail].dryColor != preterrain1.terrain.terrainData.detailPrototypes[count_detail].dryColor){synchronous = false;break;}
			if (preterrain1.detailPrototypes[count_detail].renderMode != preterrain1.terrain.terrainData.detailPrototypes[count_detail].renderMode){synchronous = false;break;}
			if (preterrain1.detailPrototypes[count_detail].bendFactor != preterrain1.terrain.terrainData.detailPrototypes[count_detail].bendFactor){synchronous = false;break;}
		}
	}
	preterrain1.detail_synchronous = synchronous;
}

function change_terrain_detail_scale(preterrain1: terrain_class)
{
	if (preterrain1.terrain.terrainData.detailPrototypes.Length < preterrain1.detailPrototypes.Count){return;}
	for (var count_detail: int = 0;count_detail < preterrain1.detailPrototypes.Count;++count_detail)
	{
		preterrain1.detailPrototypes[count_detail].minWidth = preterrain1.terrain.terrainData.detailPrototypes[count_detail].minWidth*preterrain1.detail_scale;
		preterrain1.detailPrototypes[count_detail].maxWidth = preterrain1.terrain.terrainData.detailPrototypes[count_detail].maxWidth*preterrain1.detail_scale;
		preterrain1.detailPrototypes[count_detail].minHeight = preterrain1.terrain.terrainData.detailPrototypes[count_detail].minHeight*preterrain1.detail_scale;
		preterrain1.detailPrototypes[count_detail].maxHeight = preterrain1.terrain.terrainData.detailPrototypes[count_detail].maxHeight*preterrain1.detail_scale;
	}
}

function set_all_terrain_details(preterrain1: terrain_class)
{
	set_terrain_details(preterrain1);
	for (var count_terrain: int = 0;count_terrain < terrains.Count;++count_terrain)
	{
		if (terrains[count_terrain].terrain)
		{
			terrains[count_terrain].terrain.terrainData.detailPrototypes = preterrain1.terrain.terrainData.detailPrototypes;
			get_terrain_details(terrains[count_terrain]);
			terrains[count_terrain].color_terrain = Color(0.5,1,0.5);
			check_synchronous_terrain_detail(terrains[count_terrain]);
		}
	}
}

function convert_float_to_color(value_float: float): Color
{
	var bytes: byte[] = new byte[4]; 
    var color: Color;
    var value_temp: float;
        		    		    		    		
    bytes = BitConverter.GetBytes(value_float); 
        		
    value_temp = bytes[0]; 
    color[0] = value_temp/255;
    value_temp = bytes[1];
    color[1] = value_temp/255;
    value_temp = bytes[2];
    color[2] = value_temp/255;
    value_temp = bytes[3];
    color[3] = value_temp/255;
   	
    return color;     		
}

function convert_color_to_float(color: Color): float
{	
	var bytes: byte[] = new byte[4]; 
	
	bytes[0] = color[0]*255;
    bytes[1] = color[1]*255;
    bytes[2] = color[2]*255;
    bytes[3] = color[3]*255;
	
	var value_float: float = BitConverter.ToSingle(bytes,0);

	return value_float;
}

function get_scale_from_image(image: Texture2D): float
{
	var color: Color;
	var color2: Color;
	var value_float: float;
	
	color2 = image.GetPixel(0,0);
	color[0] = color2[3];
	color2 = image.GetPixel(1,0);
	color[1] = color2[3];
	color2 = image.GetPixel(2,0);
	color[2] = color2[3];
	color2 = image.GetPixel(3,0);
	color[3] = color2[3];
	
	value_float = convert_color_to_float(color);
	
	return value_float;
}

function calc_rotation_pixel(x: float,y: float,xx: float, yy: float,rotation: float): Vector2
{
	var dx: float = x-xx;
	var dy: float = y-yy;
	var length: float = Mathf.Sqrt((dx*dx)+(dy*dy));
	
	if (length != 0)
	{
		dx = dx / length;
		dy = dy / length;
	}
	
	
	var rad: float = Mathf.Acos(dx);
	
	if (dy < 0){rad = (Mathf.PI*2)-rad;}
	
	rad -= (rotation*Mathf.Deg2Rad);
	
	dx = Mathf.Cos(rad)*length;
	dy = Mathf.Sin(rad)*length;
	
	var pos: Vector2;
	pos.x = dx+xx;
	pos.y = dy+yy;
	return pos;
}

function copy_prelayer(prelayer1: prelayer_class,copy_filter): prelayer_class
{
	var prelayer2: prelayer_class;
	
	var object: GameObject = new GameObject();
	var script3: save_template = object.AddComponent(save_template);
	
	script3.prelayer = prelayer1;
	
	var object2: GameObject = Instantiate(object);
	DestroyImmediate(object);
	script3 = object2.GetComponent(save_template);
	prelayer2 = script3.prelayer;
	DestroyImmediate(object2);
	
	if (copy_filter)
	{
		for (var count_layer: int = 0;count_layer < prelayer1.layer.Count;++count_layer)
		{
			prelayer2.layer[count_layer].prefilter = copy_prefilter(prelayer1.layer[count_layer].prefilter);
		}
	}
	
	return prelayer2;
}

function copy_layergroup(prelayer1: prelayer_class,description_number: int,copy_filter: boolean): prelayer_class
{
	var object: GameObject = new GameObject();
	var script3: save_template = object.AddComponent(save_template);
	var prelayer2: prelayer_class;
	
	script3.prelayer = new prelayer_class(0,0);
	
	for (var count_layer: int = 0;count_layer < prelayer1.predescription.description[description_number].layer_index.Count;++count_layer)
	{
		script3.prelayer.layer.Insert(count_layer,new layer_class());
		script3.prelayer.layer[count_layer] = copy_layer(prelayer1.layer[prelayer1.predescription.description[description_number].layer_index[count_layer]],false,false);
	}
	
	var object2: GameObject = Instantiate(object);
	DestroyImmediate(object);
	script3 = object2.GetComponent(save_template);
	prelayer2 = script3.prelayer;
	DestroyImmediate(object2);
	
	if (copy_filter)
	{
		for (count_layer = 0;count_layer < prelayer1.layer.Count;++count_layer)
		{
			prelayer2.layer[count_layer].prefilter = copy_prefilter(prelayer1.layer[count_layer].prefilter);
			for (var count_tree: int = 0;count_tree < prelayer1.layer[count_layer].tree_output.tree.Count;++count_tree)
			{
				prelayer2.layer[count_layer].tree_output.tree[count_tree].prefilter = copy_prefilter(prelayer1.layer[count_layer].tree_output.tree[count_tree].prefilter);
			}
		}
	}
	return prelayer2;
}

function copy_layer(layer: layer_class,copy_filter: boolean,loop: boolean): layer_class
{
	var object: GameObject = new GameObject();
	var script3: save_template = object.AddComponent(save_template);
	
	script3.layer = layer;
	
	var object2: GameObject = Instantiate(object);
	DestroyImmediate(object);
	script3 = object2.GetComponent(save_template);
	layer = script3.layer;
	DestroyImmediate(object2);
	
	if (copy_filter)
	{
		script3.layer.prefilter = copy_prefilter(layer.prefilter);
		for (var count_tree: int = 0;count_tree < layer.tree_output.tree.Count;++count_tree)
		{
			script3.layer.tree_output.tree[count_tree].prefilter = copy_prefilter(layer.tree_output.tree[count_tree].prefilter);
		}
	}
	
	layer.text_placed = String.Empty;
	
	if (loop){loop_layer(layer,1);}
	layer.swap_text = "S";
	layer.swap_select = false;
	layer.copy_select = false;
	layer.color_layer = Color(2,2,2,1);
	return layer;
} 

function save_loop_layer(prelayer_number: int,layer_number: int,prelayer_number_save: int,layer_number_save: int,script3: save_template)
{
	script3.prelayers[prelayer_number_save].layer[layer_number_save].swap_text = "S";
	script3.prelayers[prelayer_number_save].layer[layer_number_save].swap_select = false;
	script3.prelayers[prelayer_number_save].layer[layer_number_save].copy_select = false;
		
	for (var count_filter: int = 0;count_filter < prelayers[prelayer_number].layer[layer_number].prefilter.filter_index.Count;++count_filter)
	{
		script3.filters.Add(copy_filter(filter[prelayers[prelayer_number].layer[layer_number].prefilter.filter_index[count_filter]],false));
		script3.prelayers[prelayer_number_save].layer[layer_number_save].prefilter.filter_index[count_filter] = script3.filters.Count-1;
		
		for (var count_subfilter: int = 0;count_subfilter < filter[prelayers[prelayer_number].layer[layer_number].prefilter.filter_index[count_filter]].presubfilter.subfilter_index.Count;++count_subfilter)
		{
			script3.subfilters.Add(copy_subfilter(subfilter[filter[prelayers[prelayer_number].layer[layer_number].prefilter.filter_index[count_filter]].presubfilter.subfilter_index[count_subfilter]]));
			script3.filters[script3.filters.Count-1].presubfilter.subfilter_index[count_subfilter] = script3.subfilters.Count-1;	
		}
	}
	for (var count_tree: int = 0;count_tree < prelayers[prelayer_number].layer[layer_number].tree_output.tree.Count;++count_tree)
	{
		for (count_filter = 0;count_filter < prelayers[prelayer_number].layer[layer_number].tree_output.tree[count_tree].prefilter.filter_index.Count;++count_filter)
		{
			script3.filters.Add(copy_filter(filter[prelayers[prelayer_number].layer[layer_number].tree_output.tree[count_tree].prefilter.filter_index[count_filter]],false));
			script3.prelayers[prelayer_number_save].layer[layer_number_save].tree_output.tree[count_tree].prefilter.filter_index[count_filter] = script3.filters.Count-1;
			
			for (count_subfilter = 0;count_subfilter < filter[prelayers[prelayer_number].layer[layer_number].tree_output.tree[count_tree].prefilter.filter_index[count_filter]].presubfilter.subfilter_index.Count;++count_subfilter)
			{
				script3.subfilters.Add(copy_subfilter(subfilter[filter[prelayers[prelayer_number].layer[layer_number].tree_output.tree[count_tree].prefilter.filter_index[count_filter]].presubfilter.subfilter_index[count_subfilter]]));
				script3.filters[script3.filters.Count-1].presubfilter.subfilter_index[count_subfilter] = script3.subfilters.Count-1;			
			}
		}
	}
	
	for (var count_object: int = 0;count_object < prelayers[prelayer_number].layer[layer_number].object_output.object.Count;++count_object)
	{
		if (prelayers[prelayer_number].layer[layer_number].object_output.object[count_object].prelayer_created)
		{
			script3.prelayers.Add(copy_prelayer(prelayers[prelayers[prelayer_number].layer[layer_number].object_output.object[count_object].prelayer_index],false));
			script3.prelayers[prelayer_number_save].layer[layer_number_save].object_output.object[count_object].prelayer_index = script3.prelayers.Count-1;
			
			for (var count_layer: int = 0;count_layer < prelayers[prelayers[prelayer_number].layer[layer_number].object_output.object[count_object].prelayer_index].layer.Count;++count_layer)
			{
				save_loop_layer(prelayers[prelayer_number].layer[layer_number].object_output.object[count_object].prelayer_index,count_layer,prelayer_number_save+1,count_layer,script3);
			}
		}
	}
}

function load_loop_layer(prelayer_number: int,layer_number: int,prelayer_number_load: int,layer_number_load: int,script3: save_template)
{
	for (var count_filter: int = 0;count_filter < script3.prelayers[prelayer_number_load].layer[layer_number_load].prefilter.filter_index.Count;++count_filter)
	{
		filter.Add(copy_filter(script3.filters[script3.prelayers[prelayer_number_load].layer[layer_number_load].prefilter.filter_index[count_filter]],false));
		prelayers[prelayer_number].layer[layer_number].prefilter.filter_index[count_filter] = filter.Count-1;
		
		for (var count_subfilter: int = 0;count_subfilter < filter[filter.Count-1].presubfilter.subfilter_index.Count;++count_subfilter)
		{
			subfilter.Add(copy_subfilter(script3.subfilters[filter[filter.Count-1].presubfilter.subfilter_index[count_subfilter]]));
			filter[filter.Count-1].presubfilter.subfilter_index[count_subfilter] = subfilter.Count-1;
		}
	}
	for (var count_tree: int = 0;count_tree < script3.prelayers[prelayer_number_load].layer[layer_number_load].tree_output.tree.Count;++count_tree)
	{
		for (count_filter = 0;count_filter < script3.prelayers[prelayer_number_load].layer[layer_number_load].tree_output.tree[count_tree].prefilter.filter_index.Count;++count_filter)
		{
			filter.Add(copy_filter(script3.filters[script3.prelayers[prelayer_number_load].layer[layer_number_load].tree_output.tree[count_tree].prefilter.filter_index[count_filter]],false));
			prelayers[prelayer_number].layer[layer_number].tree_output.tree[count_tree].prefilter.filter_index[count_filter] = filter.Count-1;
			
			for (count_subfilter = 0;count_subfilter < filter[filter.Count-1].presubfilter.subfilter_index.Count;++count_subfilter)
			{
				subfilter.Add(copy_subfilter(script3.subfilters[filter[filter.Count-1].presubfilter.subfilter_index[count_subfilter]]));
				filter[filter.Count-1].presubfilter.subfilter_index[count_subfilter] = subfilter.Count-1;
			}
		}
	}
	
	for (var count_object: int = 0;count_object < script3.prelayers[prelayer_number_load].layer[layer_number_load].object_output.object.Count;++count_object)
	{
		if (script3.prelayers[prelayer_number_load].layer[layer_number_load].object_output.object[count_object].prelayer_created)
		{
			prelayers.Add(copy_prelayer(script3.prelayers[script3.prelayers[prelayer_number_load].layer[layer_number_load].object_output.object[count_object].prelayer_index],false));
			prelayers[prelayer_number].layer[layer_number].object_output.object[count_object].prelayer_index = prelayers.Count-1;
			
			for (var count_layer: int = 0;count_layer < script3.prelayers[script3.prelayers[prelayer_number_load].layer[layer_number_load].object_output.object[count_object].prelayer_index].layer.Count;++count_layer)
			{
				load_loop_layer(prelayers.Count-1,count_layer,script3.prelayers[prelayer_number_load].layer[layer_number_load].object_output.object[count_object].prelayer_index,count_layer,script3);
			}
		}
	}
}

function copy_description(prelayer1: prelayer_class,description_number: int,target_prelayer: prelayer_class,target_description_number: int)
{
	target_prelayer.predescription.description[target_description_number].text = prelayer1.predescription.description[description_number].text+"#";
	target_prelayer.predescription.description[target_description_number].edit = prelayer1.predescription.description[description_number].edit;
	target_prelayer.predescription.description[target_description_number].layers_active = prelayer1.predescription.description[description_number].layers_active;
	
	var layer_position: int = get_layer_position(0,target_description_number,target_prelayer);
	var length: int = prelayer1.predescription.description[description_number].layer_index.Count;
	
	for (var count_layer: int = 0;count_layer < length;++count_layer)
	{
		add_layer(target_prelayer,layer_position,layer_output_enum.color,target_description_number,0,false,false);
	        
	    target_prelayer.layer[layer_position] = copy_layer(prelayer1.layer[prelayer1.predescription.description[description_number].layer_index[length-1-count_layer]],true,true);
	}
	count_layers();
}

function copy_prefilter(prefilter: prefilter_class): prefilter_class
{
	var prefilter2: prefilter_class = new prefilter_class();
	
	for (var count_filter: int = 0;count_filter < prefilter.filter_index.Count;++count_filter)
	{
		filter.Add(copy_filter(filter[prefilter.filter_index[count_filter]],true));
		prefilter2.filter_index.Add(filter.Count-1);
	}
	prefilter2.set_filter_text();
	
	return prefilter2;
}

function copy_filter(filter: filter_class,copy_subfilter: boolean): filter_class
{
	var object: GameObject = new GameObject();
	var script3: save_template = object.AddComponent(save_template);
	
	script3.filter = filter;
	
	var object2: GameObject = Instantiate(object);
	DestroyImmediate(object);
	script3 = object2.GetComponent(save_template);
	filter = script3.filter;
	DestroyImmediate(object2);
	
	if (copy_subfilter)
	{
		for (var count_subfilter: int;count_subfilter < filter.presubfilter.subfilter_index.Count;++count_subfilter)
		{
			subfilter.Add(copy_subfilter(subfilter[filter.presubfilter.subfilter_index[count_subfilter]]));
			filter.presubfilter.subfilter_index[count_subfilter] = subfilter.Count-1;
		}
	}
	
	for (var count_color_range: int = 0;count_color_range < filter.preimage.precolor_range.color_range.Count;++count_color_range)
	{
		filter.preimage.precolor_range.color_range[count_color_range].swap_text = "S";
		filter.preimage.precolor_range.color_range[count_color_range].swap_select = false;
		filter.preimage.precolor_range.color_range[count_color_range].copy_select = false;
	}
	
	filter.swap_text = "S";
	filter.swap_select = false;
	filter.copy_select = false;
	filter.prerandom_curve.curve_text = "Curve";
	filter.precurve_x_left.curve_text = "Curve";
	filter.precurve_x_right.curve_text = "Curve";
	filter.precurve_z_left.curve_text = "Curve";
	filter.precurve_z_right.curve_text = "Curve";
	filter.color_filter = Color(2,2,2,1);
	return filter;
}

function copy_subfilter(subfilter: subfilter_class): subfilter_class
{
	var object: GameObject = new GameObject();
	var script3: save_template = object.AddComponent(save_template);
	
	script3.subfilter = subfilter;
	
	var object2: GameObject = Instantiate(object);
	DestroyImmediate(object);
	script3 = object2.GetComponent(save_template);
	subfilter = script3.subfilter;
	DestroyImmediate(object2);
	subfilter.swap_text = "S";
	subfilter.swap_select = false;
	subfilter.copy_select = false;
	
	for (var count_color_range: int = 0;count_color_range < subfilter.preimage.precolor_range.color_range.Count;++count_color_range)
	{
		subfilter.preimage.precolor_range.color_range[count_color_range].swap_text = "S";
		subfilter.preimage.precolor_range.color_range[count_color_range].swap_select = false;
		subfilter.preimage.precolor_range.color_range[count_color_range].copy_select = false;
	}
	subfilter.color_subfilter = Color(2,2,2,1);
	return subfilter;
}

function copy_terrain(preterrain1: terrain_class): terrain_class
{
	var object: GameObject = new GameObject();
	var script3: save_template = object.AddComponent(save_template);
		
	script3.preterrain = preterrain1;
		
	var object2: GameObject = Instantiate(object);
	DestroyImmediate(object);
	script3 = object2.GetComponent(save_template);
	preterrain1 = script3.preterrain;
	DestroyImmediate(object2);
	return preterrain1;
}

function copy_animation_curve(animation_curve: animation_curve_class): animation_curve_class
{
	var object: GameObject = new GameObject();
	var script3: save_template = object.AddComponent(save_template);
		
	script3.animation_curve = animation_curve;
		
	var object2: GameObject = Instantiate(object);
	DestroyImmediate(object);
	script3 = object2.GetComponent(save_template);
	animation_curve = script3.animation_curve;
	DestroyImmediate(object2);
	return animation_curve;
}

function copy_color_range(color_range: color_range_class): color_range_class
{
	var object: GameObject = new GameObject();
	var script3: save_template = object.AddComponent(save_template);
		
	script3.color_range = color_range;
		
	var object2: GameObject = Instantiate(object);
	DestroyImmediate(object);
	script3 = object2.GetComponent(save_template);
	color_range = script3.color_range;
	DestroyImmediate(object2);
	color_range.swap_text = "S";
	color_range.swap_select = false;
	color_range.copy_select = false;	
	return color_range;
}

function copy_precolor_range(precolor_range: precolor_range_class): precolor_range_class
{
	var object: GameObject = new GameObject();
	var script3: save_template = object.AddComponent(save_template);
		
	script3.precolor_range = precolor_range;
		
	var object2: GameObject = Instantiate(object);
	DestroyImmediate(object);
	script3 = object2.GetComponent(save_template);
	precolor_range = script3.precolor_range;
	DestroyImmediate(object2);
	return precolor_range;
}

function copy_tree(tree: tree_class): tree_class
{
	var object: GameObject = new GameObject();
	var script3: save_template = object.AddComponent(save_template);
	
	script3.tree = tree;
	
	var object2: GameObject = Instantiate(object);
	DestroyImmediate(object);
	script3 = object2.GetComponent(save_template);
	tree = script3.tree;
	DestroyImmediate(object2);
	
	for (var count_filter: int = 0;count_filter < tree.prefilter.filter_index.Count;++count_filter)
	{
		filter.Add(copy_filter(filter[tree.prefilter.filter_index[count_filter]],true));
		tree.prefilter.filter_index[count_filter] = filter.Count-1;
	}
	tree.placed = 0;
	tree.swap_select = false;
	tree.copy_select = false;
	tree.swap_text = "S";
	return tree;
}	

function copy_object(object1: object_class): object_class
{
	var object: GameObject = new GameObject();
	var script3: save_template = object.AddComponent(save_template);
	
	script3.object = object1;
	
	var object2: GameObject = Instantiate(object);
	DestroyImmediate(object);
	script3 = object2.GetComponent(save_template);
	object1 = script3.object;
	DestroyImmediate(object2);
	object1.color_object = Color(2,2,2,1);
	object1.swap_text = "S";
	object1.swap_select = false;
	object1.copy_select = false;
	object1.placed = 0;
	return object1;
}

function check_terrains_same_resolution(): int
{
	for (var count_terrain: int = 0;count_terrain < terrains.Count;++count_terrain)
	{
		if (!terrains[count_terrain].terrain){return -2;}
		if (!terrains[count_terrain].terrain.terrainData){return -2;}
		if (terrains[count_terrain].terrain.terrainData.heightmapResolution != terrains[0].terrain.terrainData.heightmapResolution){return -1;}
	}
	return 1;
}

function stitch_terrains(border_influence: float): boolean
{
	var line_x: float = Mathf.Round(border_influence/terrains[0].heightmap_conversion.x);
	var line_y: float = Mathf.Round(border_influence/terrains[0].heightmap_conversion.y);
	
	if (border_influence < terrains[0].heightmap_conversion.x*1.5){return false;}
	var strength: float = stitch_tool_strength;
	var count_terrain2: int;
	var terrain_x: int;
	var terrain_y: int;
	var x1: float;
	var y1: float;
	var heights_x1: float[,];
	var heights_x2: float[,];
	
	var height0: float;
	var height1: float;
	var height2: float;
	
	var height_e1: float;
	var height_e2: float;
	var delta_e1: float;
	var delta_e2: float;
	
	var height_o1: float;
	var height_o2: float;
	var delta_o1: float;
	var delta_o2: float;
	
	for (var count_terrain: int = 0;count_terrain < terrains.Count;++count_terrain)
	{
		terrain_x = -1;
		terrain_y = -1;
		
		for (count_terrain2 = 0;count_terrain2 < terrains.Count;++count_terrain2)
		{
			if (count_terrain2 == count_terrain){continue;}
			if (terrains[count_terrain2].rect.Contains(Vector2(terrains[count_terrain].rect.center.x,terrains[count_terrain].rect.yMax+terrains[count_terrain].heightmap_conversion.y)) && terrain_x == -1)
			{
				terrain_x = count_terrain2;
			}
			if (terrains[count_terrain2].rect.Contains(Vector2(terrains[count_terrain].rect.xMin-terrains[count_terrain].heightmap_conversion.x,terrains[count_terrain].rect.center.y)) && terrain_y == -1)
			{
				terrain_y = count_terrain2;
			}
		}
		
		if (terrain_x != -1)
		{
			heights_x1 = terrains[count_terrain].terrain.terrainData.GetHeights(0,terrains[count_terrain].heightmap_resolution-(line_y),terrains[count_terrain].heightmap_resolution,line_y);
			heights_x2 = terrains[terrain_x].terrain.terrainData.GetHeights(0,0,terrains[count_terrain].heightmap_resolution,line_y);
			
			for (var x: int = 0;x < terrains[count_terrain].heightmap_resolution;++x)
			{
				height_e1 = heights_x1[0,x];
				height_e2 = heights_x2[line_y-1,x];
				
				for (y1 = 0;y1 < line_y-1;++y1)
				{
					if (y1 == 0) 
					{
						height1 = heights_x1[line_y-y1-1,x];
						height2 = heights_x2[y1,x];
						height0 = (height_e1+height_e2)/2;
						//height0 *= (stitch_tool_curve.Evaluate(0.5)+0.5);
						delta_e1 = (height_e1-height0)/(line_y-1);
						// delta_o1 = (height_e1-height1)/(line_y-1);
						
						delta_e2 = (height_e2-height0)/(line_y-1);
						// delta_o2 = (height_e2-height2)/(line_y-1);
						
						heights_x1[line_y-y1-1,x] = height0;
						heights_x2[y1,x] = height0;
					}
					else
					{
						heights_x1[line_y-y1-1,x] = height0+(delta_e1*y1);
						heights_x2[y1,x] = height0+(delta_e2*y1);
					}
				}	
			}
			terrains[count_terrain].terrain.terrainData.SetHeights(0,terrains[count_terrain].heightmap_resolution-line_y,heights_x1);
			terrains[terrain_x].terrain.terrainData.SetHeights(0,0,heights_x2);
		} 
		
		if (terrain_y != -1)
		{
			heights_x1 = terrains[count_terrain].terrain.terrainData.GetHeights(0,0,line_x,terrains[count_terrain].heightmap_resolution);
			heights_x2 = terrains[terrain_y].terrain.terrainData.GetHeights(terrains[count_terrain].heightmap_resolution-line_x,0,line_x,terrains[count_terrain].heightmap_resolution);
			
			for (var y: int = 0;y < terrains[count_terrain].heightmap_resolution;++y)
			{
				height_e1 = heights_x1[y,line_x-1];
				height_e2 = heights_x2[y,0];
				
				for (x1 = 0;x1 < line_x-1;++x1)
				{
					if (x1 == 0)
					{
						height1 = heights_x1[y,x1];
						height2 = heights_x2[y,line_x-x1-1];
						height0 = (height_e1+height_e2)/2;
						delta_e1 = (height_e1-height0)/(line_x-1);
						delta_e2 = (height_e2-height0)/(line_x-1);
						heights_x1[y,x1] = height0;
						heights_x2[y,line_x-x1-1] = height0;
					}
					else
					{
						heights_x1[y,x1] = height0+(delta_e1*x1);
						heights_x2[y,line_x-x1-1] = height0+(delta_e2*x1);
					}
				}	
			}
			terrains[count_terrain].terrain.terrainData.SetHeights(0,0,heights_x1);
			terrains[terrain_y].terrain.terrainData.SetHeights(terrains[count_terrain].heightmap_resolution-line_x,0,heights_x2);
		}
		if (terrains[count_terrain].color_terrain[0] < 1.5){terrains[count_terrain].color_terrain += Color(0.5,0.5,1,0.5);}
	}
	return true;
}

function smooth_terrain(preterrain1: terrain_class,strength: float)
{
	if (!preterrain1.terrain){return;}
	
	var heightmap_resolution: int = preterrain1.terrain.terrainData.heightmapResolution;
	var point: float;
	var delta_point: float;
	var point1: float;
	var point3: float;
	
	preterrain1.heights = preterrain1.terrain.terrainData.GetHeights(0,0,heightmap_resolution,heightmap_resolution);
	
	for (var count_strength: int = 0;count_strength < smooth_tool_repeat;++count_strength)
	{
		for (var y: int = 0;y < heightmap_resolution;++y)
		{
			for (var x: int = 1;x < heightmap_resolution-1;++x)
			{
				point1 = preterrain1.heights[x-1,y];
				point = preterrain1.heights[x,y];
				point3 = preterrain1.heights[x+1,y];
				
				delta_point = point-((point1+point3)/2);
				delta_point *= (1-strength);
				preterrain1.heights[x,y] = delta_point+((point1+point3)/2);
			}
		}
	
		for (y = 1;y < heightmap_resolution-1;++y)
		{
			for (x = 0;x < heightmap_resolution;++x)
			{
				point1 = preterrain1.heights[x,y-1];
				point = preterrain1.heights[x,y];
				point3 = preterrain1.heights[x,y+1];
				
				delta_point = point-((point1+point3)/2);
				delta_point *= (1-strength);
				preterrain1.heights[x,y] = delta_point+((point1+point3)/2);
			}
		}
	}
	
	preterrain1.terrain.terrainData.SetHeights(0,0,preterrain1.heights);
	if (preterrain1.color_terrain[0] < 1.5){preterrain1.color_terrain += Color(0.5,0.5,1,0.5);}
}

function smooth_all_terrain(strength: int)
{
	for (var count_terrain: int = 0;count_terrain < terrains.Count;++count_terrain)
	{
		smooth_terrain(terrains[count_terrain],smooth_tool_strength);
	}
}

function set_smooth_tool_terrain_popup()
{
	if (terrains.Count > 1)
	{
		smooth_tool_terrain = new String[terrains.Count+1];
		smooth_tool_terrain[terrains.Count] = "All";
		if (smooth_tool_terrain_select > terrains.Count+1){smooth_tool_terrain_select = terrains.Count;}
	} 
		else 
		{
			smooth_tool_terrain = new String[1];
			smooth_tool_terrain_select = 0;
		}
	
	for (var count_terrain: int = 0;count_terrain < terrains.Count;++count_terrain)
	{
		smooth_tool_terrain[count_terrain] = terrains[count_terrain].name;	
	}
}

function convert_software_version()
{
	if (converted_version < 1.04)
	{
		// convert to filter select
		var count_color_range: int = 0;
		
		for (var count_prelayer: int = 0;count_prelayer < prelayers.Count;++count_prelayer)
		{
			for (var count_layer: int = 0;count_layer < prelayers[count_prelayer].layer.Count;++count_layer)
			{
				for (var count_precolor_range: int = 0;count_precolor_range < prelayers[count_prelayer].layer[count_layer].color_output.precolor_range.Count;++count_precolor_range)
				{
					convert_precolor_range(prelayers[count_prelayer].layer[count_layer].color_output.precolor_range[count_precolor_range]);
				}
			}
		}
		
		for (var count_filter: int = 0;count_filter < filter.Count;++count_filter)
		{
			convert_precolor_range(filter[count_filter].preimage.precolor_range);
		}
		
		for (var count_subfilter: int = 0;count_subfilter < subfilter.Count;++count_subfilter)
		{
			convert_precolor_range(subfilter[count_filter].preimage.precolor_range);
		}
		
		converted_version = 1.04;	
	}
}

function convert_precolor_range(precolor_range: precolor_range_class)
{
	precolor_range.color_range_value.calc_value();
}

function filter_texture()
{
	if (!texture_tool.preimage.image[0]){return;}
	var width: int = texture_tool.preimage.image[0].width;
	var height: int = texture_tool.preimage.image[0].height;
	
	if (texture_tool.preimage.image.Count == 1){texture_tool.preimage.image.Add(new Texture2D(1,1));}
	if (!texture_tool.preimage.image[1]){texture_tool.preimage.image[1] = new Texture2D(1,1);}
	
	var width2: int = texture_tool.preimage.image[1].width;
	var height2: int = texture_tool.preimage.image[1].height; 
	
	if (width2 != width || height2 != height)
	{
		texture_tool.preimage.image[1].Resize(width,height);
	}
	
	var color_range_length: int = texture_tool.precolor_range.color_range.Count;
	var in_range: boolean = false;
	var color_end: Color;
	
	var pixel: Color;
	
	for (var y: int = 0;y < height;++y)
	{
		for (var x: int = 0;x < width;++x)
		{
			in_range = false;
			pixel = texture_tool.preimage.image[0].GetPixel(x,y);
			
			for (var count_color_range: int = 0;count_color_range < color_range_length;++count_color_range)
			{
				if (texture_tool.precolor_range.color_range_value.active[count_color_range])
				{
					if (texture_tool.precolor_range.color_range[count_color_range].one_color){color_end = texture_tool.precolor_range.color_range[count_color_range].color_start;} else {color_end = texture_tool.precolor_range.color_range[count_color_range].color_end;}
					if (color_in_range(pixel,texture_tool.precolor_range.color_range[count_color_range].color_start,color_end))
					{
					 	if (!texture_tool.precolor_range.color_range[count_color_range].invert){in_range = true;} 
					}
					else if (texture_tool.precolor_range.color_range[count_color_range].invert){in_range = true;}
				}
			}
			if (!in_range){pixel = Color(0,0,0);}
			texture_tool.preimage.image[1].SetPixel(x,y,pixel);
		}
	}
	texture_tool.preimage.image[1].Apply();
}

function set_curve_linear(curve: AnimationCurve): AnimationCurve
{
	var curve3: AnimationCurve = new AnimationCurve();
	for (var count_key: int = 0;count_key < curve.keys.Length;++count_key)
	{
		var intangent: float = 0;
		var outtangent: float = 0;
		var intangent_set: boolean = false;
		var outtangent_set: boolean = false;
		var point1: Vector2;
		var point2: Vector2;
		var deltapoint: Vector2;
		var key: Keyframe = curve[count_key];
		
		if (count_key == 0){intangent = 0;intangent_set = true;}
		if (count_key == curve.keys.Length -1){outtangent = 0;outtangent_set = true;}
		
		if (!intangent_set)
		{
			point1.x = curve.keys[count_key-1].time;
			point1.y = curve.keys[count_key-1].value;
			point2.x = curve.keys[count_key].time;
			point2.y = curve.keys[count_key].value;
				
			deltapoint = point2-point1;
			
			intangent = deltapoint.y/deltapoint.x;
		}
		if (!outtangent_set)
		{
			point1.x = curve.keys[count_key].time;
			point1.y = curve.keys[count_key].value;
			point2.x = curve.keys[count_key+1].time;
			point2.y = curve.keys[count_key+1].value;
				
			deltapoint = point2-point1;
					
			outtangent = deltapoint.y/deltapoint.x;
		}
				
		key.inTangent = intangent;
		key.outTangent = outtangent;
		curve3.AddKey(key);
	}
	return curve3;
}

function perlin_noise(x: float,y: float,offset_x: float,offset_y: float,frequency: float,octaves: float,detail_strength: float): float
{
	frequency *= current_layer.zoom;
	offset_x += current_layer.offset.x;
	offset_y += current_layer.offset.y;
	
	var perlin: float = (Mathf.PerlinNoise((x+(frequency*(offset_x+50)))/frequency,(y+(frequency*(offset_y+50)))/frequency));
    var pow_octave: float = 2;
				
	for (var count_octaves: float = 1;count_octaves < octaves;++count_octaves)
	{
		perlin += (Mathf.PerlinNoise((x+(frequency*(offset_x+50)))/(frequency/pow_octave),(y+(frequency*(offset_y+50)))/(frequency/pow_octave))-0.5)/pow_octave;
		pow_octave *= detail_strength;
	}
	return perlin;
}

function create_perlin(preview_resolution: int,resolution: int,mode: export_mode_enum,save: boolean)
{
	var step: float = (resolution*1.0)/(preview_resolution*1.0);
	
	var count_octaves: int;
	var y: float;
	var x: float;
	var pow_octave: float;
	var pow_resolution: int = preview_resolution*preview_resolution;
	var pos: int;
	var frequency: float = heightmap_tool.perlin.frequency;
	
	if (mode == export_mode_enum.Image)
	{
		if (mode == export_mode_enum.Image){var pixels: Color[] = new Color[pow_resolution];}
	
		var color: Color;
		
		for (y = 0;y < resolution;y += step)
		{
			for (x = 0;x < resolution;x += step)
			{
				color[0] = (Mathf.PerlinNoise((-(resolution/2)+x+(frequency*(heightmap_tool.perlin.offset.x+5000)))/frequency,(-(resolution/2)+y+(frequency*(heightmap_tool.perlin.offset.y+5000)))/frequency));
				pow_octave = 2;
				
				for (count_octaves = 1;count_octaves < heightmap_tool.perlin.octaves;++count_octaves)
				{
					color[0] += (Mathf.PerlinNoise((-(resolution/2)+x+(frequency*(heightmap_tool.perlin.offset.x+5000)))/(frequency/pow_octave),(-(resolution/2)+y+(frequency*(heightmap_tool.perlin.offset.y+5000)))/(frequency/pow_octave))-0.5)/pow_octave;
					pow_octave *= 2;//heightmap_tool.pow_strength;
				}
				color[0] = heightmap_tool.perlin.precurve.curve.Evaluate(color[0]);
				color[1] = color[0];
				color[2] = color[0];
				
				pos = (x/step)+((y/step)*preview_resolution);
				if (pos > pow_resolution-1){pos = pow_resolution-1;}
				
				pixels[pos] = color;
			}
		}
		
		if (save)
		{
		    if (preview_resolution != heightmap_tool.output_texture.width)
			{
				heightmap_tool.output_texture.Resize(resolution,resolution);
			}
			heightmap_tool.output_texture.SetPixels(pixels);
			heightmap_tool.output_texture.Apply();
		}
		else
		{
			heightmap_tool.preview_texture.SetPixels(pixels);
			heightmap_tool.preview_texture.Apply();
		}
		return;
	}
	else if (mode == export_mode_enum.Raw && save)
	{
		heightmap_tool.raw_save_file.bytes = new byte[resolution*resolution*2];
		
		var count_x: int = 0;
		var count_y: int = 0;
		var byte_hi: int;
		var byte_lo: int;
		var i: int = 0;
		var value_int: ushort;
		var height: float;
		    	    	    	    	    	    	    	    	    	    	    	    	
	    if (heightmap_tool.raw_save_file.mode == raw_mode_enum.Mac)
	    {
		   	for (x = 0;x < resolution;++x) 
		   	{
				for (y = 0;y < resolution;++y) 
				{
				
					height = (Mathf.PerlinNoise((x+heightmap_tool.perlin.offset.x+1000000)/heightmap_tool.perlin.frequency,(y+heightmap_tool.perlin.offset.y+1000000)/heightmap_tool.perlin.frequency));
					pow_octave = 2;
					
					for (count_octaves = 1;count_octaves < heightmap_tool.perlin.octaves;++count_octaves)
					{
						height += (Mathf.PerlinNoise((x+heightmap_tool.perlin.offset.x+1000000)/(heightmap_tool.perlin.frequency/pow_octave),(y+heightmap_tool.perlin.offset.y+1000000)/(heightmap_tool.perlin.frequency/pow_octave))-0.5)/pow_octave;
						pow_octave *= 2;
					}
					
					height = heightmap_tool.perlin.precurve.curve.Evaluate(height)*65535;
					
					if (height < 0){height = 0;}
					if (height > 65535){height = 65535;}
	
					value_int = height;
					
					byte_hi = value_int >> 8;
					byte_lo = value_int-(byte_hi << 8);
					
					heightmap_tool.raw_save_file.bytes[i++] = byte_hi;
					heightmap_tool.raw_save_file.bytes[i++] = byte_lo;
				}
			}
		}
				
		else if (heightmap_tool.raw_save_file.mode == raw_mode_enum.Windows)
		{
			for (x = 0;x < resolution;++x) 
		   	{
				for (y = 0;y < resolution;++y) 
				{
					height = (Mathf.PerlinNoise((x+heightmap_tool.perlin.offset.x+1000000)/heightmap_tool.perlin.frequency,(y+heightmap_tool.perlin.offset.y+1000000)/heightmap_tool.perlin.frequency));
					pow_octave = 2;
					
					for (count_octaves = 1;count_octaves < heightmap_tool.perlin.octaves;++count_octaves)
					{
						height += (Mathf.PerlinNoise((x+heightmap_tool.perlin.offset.x+1000000)/(heightmap_tool.perlin.frequency/pow_octave),(y+heightmap_tool.perlin.offset.y+1000000)/(heightmap_tool.perlin.frequency/pow_octave))-0.5)/pow_octave;
						pow_octave *= 2;
					}
					
					height = heightmap_tool.perlin.precurve.curve.Evaluate(height)*65535;
					
					if (height < 0){height = 0;}
					if (height > 65535){height = 65535;}
					
					value_int = height;
					
					byte_hi = value_int >> 8;
					byte_lo = value_int-(byte_hi << 8);
					
					heightmap_tool.raw_save_file.bytes[i++] = byte_lo;
					heightmap_tool.raw_save_file.bytes[i++] = byte_hi;
				}
			}
		}
		
		File.WriteAllBytes(heightmap_tool.export_path+"/"+heightmap_tool.export_file+".raw",heightmap_tool.raw_save_file.bytes);
		heightmap_tool.raw_save_file.bytes = new byte[0];
	}
}

function generate_pattern_start(): boolean
{
	if (pattern_tool.clear)
	{
		for (var y: int = 0;y < pattern_tool.output_texture.height;++y)
		{
			for (var x: int = 0;x < pattern_tool.output_texture.width;++x)
			{
				pattern_tool.output_texture.SetPixel(x,y,Color(0,0,0));
			}
		}
	}
	pattern_tool.place_total = 0;
	
	for (var count_pattern: int = 0;count_pattern < pattern_tool.patterns.Count;++count_pattern)
	{
		if (!pattern_tool.patterns[count_pattern].input_texture){return false;}
		
		pattern_tool.patterns[count_pattern].pattern_placed.Clear();
		pattern_tool.patterns[count_pattern].placed_max = false;
		pattern_tool.place_total += pattern_tool.patterns[count_pattern].place_max;
		pattern_tool.patterns[count_pattern].width = pattern_tool.patterns[count_pattern].input_texture.width/pattern_tool.patterns[count_pattern].count_x;
		pattern_tool.patterns[count_pattern].height = pattern_tool.patterns[count_pattern].input_texture.height/pattern_tool.patterns[count_pattern].count_y;
	}
	return true;
}

function generate_pattern(): boolean
{
	var generate_stop: boolean = true;
	pick_pattern();
	draw_pattern();
	
	for (var count_pattern: int = 0;count_pattern < pattern_tool.patterns.Count;++count_pattern)
	{
		if (!pattern_tool.patterns[count_pattern].placed_max && pattern_tool.patterns[count_pattern].active){generate_stop = false;}
	}
	return generate_stop;
}

function pick_pattern()
{
	var pattern_index: int;
	
	do
	{
		pattern_index = UnityEngine.Random.Range(0,pattern_tool.patterns.Count);
	}
	while (pattern_tool.patterns[pattern_index].placed_max || !pattern_tool.patterns[pattern_index].active);
	
	pattern_tool.current_pattern = pattern_tool.patterns[pattern_index];
	pattern_tool.current_pattern.current_x = UnityEngine.Random.Range(0,pattern_tool.current_pattern.count_x);
	pattern_tool.current_pattern.current_y = UnityEngine.Random.Range(0,pattern_tool.current_pattern.count_y);
	pattern_tool.current_pattern.rotation = UnityEngine.Random.Range(pattern_tool.current_pattern.rotation_start,pattern_tool.current_pattern.rotation_end);
	
	pattern_tool.current_pattern.width2 = pattern_tool.current_pattern.width/2;
	pattern_tool.current_pattern.height2 = pattern_tool.current_pattern.height/2;
	
	pattern_tool.current_pattern.start_x = pattern_tool.current_pattern.current_x*pattern_tool.current_pattern.width;
	pattern_tool.current_pattern.start_y = pattern_tool.current_pattern.current_y*pattern_tool.current_pattern.height;
	
	pattern_tool.current_pattern.scale.x = 1/(UnityEngine.Random.Range(pattern_tool.current_pattern.scale_start.x,pattern_tool.current_pattern.scale_end.x));
	var range_scale_x: float = pattern_tool.current_pattern.scale_end.x-pattern_tool.current_pattern.scale_start.x;
	var scale_xn: float = pattern_tool.current_pattern.scale.x-pattern_tool.current_pattern.scale_start.x;
	var pos_scale_x: float = (scale_xn/range_scale_x)*100;
	
	pattern_tool.current_pattern.scale.y = pattern_tool.current_pattern.scale.x;
	var range_scale_y: float = pattern_tool.current_pattern.scale_end.y-pattern_tool.current_pattern.scale_start.y;
	var scale_yn: float = pattern_tool.current_pattern.scale.y-pattern_tool.current_pattern.scale_start.y;
	var pos_scale_y: float = (scale_yn/range_scale_y)*100;
	
	var delta_pos: float = Mathf.Abs(pos_scale_x-pos_scale_y);
}

function draw_pattern()
{
	if (pattern_tool.current_pattern.pattern_placed.Count >= pattern_tool.current_pattern.place_max){pattern_tool.current_pattern.placed_max = true;return;}
	
	var pivot: Vector2;
	var pixel: Color;
	var pixel2: Color;
	var pixel_pos: Vector2;
	var new_pos: Vector2;
	var place: boolean = false;
	pivot.x = UnityEngine.Random.Range(0-(pattern_tool.current_pattern.width),pattern_tool.output_texture.width);
	pivot.y = UnityEngine.Random.Range(0-(pattern_tool.current_pattern.height),pattern_tool.output_texture.height);
	var rotation: float = pattern_tool.current_pattern.rotation;
	
	for (var y: float = 0;y < pattern_tool.current_pattern.height+pattern_tool.current_pattern.height2;y += pattern_tool.current_pattern.scale.y)
	{
		for (var x: float = 0;x < pattern_tool.current_pattern.width+pattern_tool.current_pattern.width2;x += pattern_tool.current_pattern.scale.x)
		{
			new_pos.x = (x/pattern_tool.current_pattern.scale.x)+pivot.x;
			new_pos.y = (y/pattern_tool.current_pattern.scale.y)+pivot.y;
			if (new_pos.x >= pattern_tool.output_resolution.x || new_pos.y >= pattern_tool.output_resolution.y || new_pos.x < 0 || new_pos.y < 0){continue;}
			
			pixel_pos.x = x+pattern_tool.current_pattern.start_x-(pattern_tool.current_pattern.width2/2);
			pixel_pos.y = y+pattern_tool.current_pattern.start_y-(pattern_tool.current_pattern.height2/2);
			pixel_pos = calc_rotation_pixel(pixel_pos.x,pixel_pos.y,pattern_tool.current_pattern.start_x+(pattern_tool.current_pattern.width/2),pattern_tool.current_pattern.start_y+(pattern_tool.current_pattern.height/2),pattern_tool.current_pattern.rotation);
			if (pixel_pos.x-pattern_tool.current_pattern.start_x < 0 || pixel_pos.x-pattern_tool.current_pattern.start_x > pattern_tool.current_pattern.width){continue;}
			if (pixel_pos.y-pattern_tool.current_pattern.start_y < 0 || pixel_pos.y-pattern_tool.current_pattern.start_y > pattern_tool.current_pattern.height){continue;}
			pixel = pattern_tool.current_pattern.input_texture.GetPixel(pixel_pos.x,pixel_pos.y)*pattern_tool.current_pattern.color;
			pixel[0] *= pattern_tool.current_pattern.strength;
			pixel[1] *= pattern_tool.current_pattern.strength;
			pixel[2] *= pattern_tool.current_pattern.strength;
			
			pixel2 = pattern_tool.output_texture.GetPixel(new_pos.x,new_pos.y);
			place = false;
			for (var count_color_range: int = 0;count_color_range < pattern_tool.current_pattern.precolor_range.color_range.Count;++count_color_range)
			{
				if (color_in_range(pixel,pattern_tool.current_pattern.precolor_range.color_range[count_color_range].color_start,pattern_tool.current_pattern.precolor_range.color_range[count_color_range].color_end))
				{
					if (!pattern_tool.current_pattern.precolor_range.color_range[count_color_range].invert){place = true;}
				} else if (pattern_tool.current_pattern.precolor_range.color_range[count_color_range].invert){place = true;}
			}
			switch(pattern_tool.current_pattern.output)
			{
				case condition_output_enum.add:
					pixel += pixel2;
					break;
				
				case condition_output_enum.subtract:
					pixel = pixel2-pixel;
					break;
				
				case condition_output_enum.change:
					break;
				
				case condition_output_enum.multiply:
					pixel = pixel2*pixel;
					break;
					
				case condition_output_enum.devide:
					pixel[0] = pixel2[0]/pixel[0];
					pixel[1] = pixel2[1]/pixel[1];
					pixel[2] = pixel2[2]/pixel[2];
					break;
					
				case condition_output_enum.difference:
					pixel[0] = Mathf.Abs(pixel2[0]-pixel[0]);
					pixel[1] = Mathf.Abs(pixel2[1]-pixel[1]);
					pixel[2] = Mathf.Abs(pixel2[2]-pixel[2]);
					break;
				
				case condition_output_enum.average:
					pixel = (pixel+pixel2)/2;
					break;
					
				case condition_output_enum.max:
					if (pixel[0] < pixel2[0] && pixel[1] < pixel2[1] && pixel[2] < pixel2[2]){place = false;}
					break;
				
				case condition_output_enum.max:
					if (pixel[0] > pixel2[0] && pixel[1] > pixel2[1] && pixel[2] > pixel2[2]){place = false;}
					break;
			}
			
			if (place){pattern_tool.output_texture.SetPixel(new_pos.x,new_pos.y,pixel);}
			
		}
	}
	pattern_tool.current_pattern.pattern_placed.Add(pivot);
}
	
function export_texture_to_file(path: String,file: String,export_texture: Texture2D)
{
	var bytes: byte[] = export_texture.EncodeToPNG();
	File.WriteAllBytes(path+"/"+file+".png",bytes);	
}

function export_bytes_to_file(path: String,file: String)
{
	
	File.WriteAllBytes(path+"/"+file+".tc",export_bytes);	
} 

function calc_floor(number: float): float
{
	var number_int: int = number;
	return number_int; 
}

// line placement
function create_object_line(object_output: object_output_class)
{
	var pivot: Transform = new GameObject().transform;
	var distance: float; 
	var line_length: int;
	var object: GameObject;
	
	var pointa: Vector3;
	var pointb: Vector3;
	
	for (var count_point: int = 0;count_point < object_output.placed_reference.line_placement.line_list[0].points.Count-1;++count_point)
	{
		if (count_point == object_output.placed_reference.line_placement.line_list[0].points.Count-1){pointb = object_output.placed_reference.line_placement.line_list[0].points[0];}
		else {pointb = object_output.placed_reference.line_placement.line_list[0].points[count_point+1];}
		if (count_point == 0){pivot.position = object_output.placed_reference.line_placement.line_list[0].points[0];}

		distance = Vector3.Distance(pivot.position,pointb);		
		line_length = distance/(object_output.placed_reference.object[0].mesh_size.x*2);
		pivot.rotation = Quaternion.LookRotation(pointb-pivot.position);
		
		for (var count_line: int = 0;count_line < line_length;++count_line)
		{
			pivot.position.y = terrains[0].terrain.SampleHeight(pivot.position);
			object = Instantiate(object_output.placed_reference.object[0].object1,pivot.position,pivot.rotation);
			object.transform.position += object.transform.forward*(object_output.placed_reference.object[0].mesh_size.x);
			object.transform.Rotate(0,90,0);
			object.transform.parent = object_output.placed_reference.object[0].parent;
			pivot.position += pivot.forward*(object_output.placed_reference.object[0].mesh_size.x*2);
		}
	}
	DestroyImmediate(pivot.gameObject);
}

function erosion_alive()
{
	for (var count_erosion: int = 0;count_erosion < erosion_list.Count;++count_erosion)
	{
		if (erosion_list[count_erosion]){erosion_list[count_erosion].erosion();} else {erosion_list.RemoveAt(count_erosion);--count_erosion;}
	}
}

function normalize_splat(preterrain1: terrain_class)
{
	var splat_length: int = preterrain1.terrain.terrainData.splatPrototypes.Length;
	preterrain1.map = preterrain1.terrain.terrainData.GetAlphamaps(0,0,preterrain1.terrain.terrainData.alphamapResolution,preterrain1.terrain.terrainData.alphamapResolution);
	var splat_total: float;
	
	for (var count_y: int = 0;count_y < preterrain.splatmap_resolution;++count_y)
	{
		for (var count_x: int = 0;count_x < preterrain.splatmap_resolution;++count_x)
		{
			splat_total = 0;
			
			for (var count_splat: int = 0;count_splat < splat_length;++count_splat)
			{
				splat_total += preterrain1.map[count_x,count_y,count_splat];
			}
			
			for (count_splat = 0;count_splat < splat_length;++count_splat)
			{
				preterrain1.map[count_x,count_y,count_splat] = preterrain1.map[count_x,count_y,count_splat]/(splat_total);
			}
		}
	}
	preterrain1.terrain.terrainData.SetAlphamaps(0,0,preterrain1.map);
}

function calc_terrain_angle(preterrain1: terrain_class,x: float, y: float,smooth: int): float
{
	var size: Vector3 = preterrain1.terrain.terrainData.size;
	var resolution: float = preterrain1.terrain.terrainData.heightmapResolution;
    var conversion: float = size.x/(resolution-1);
	
	var px: short = (x/conversion);
	var py: short = (y/conversion);
	var multi_terrain: boolean = false;
	
	var p1_x: short = px - smooth;
	var p1_y: short = py + smooth;
	var p1_tile_x: short = preterrain1.tile_x;
	var p1_tile_y: short = preterrain1.tile_z;
	
	var p2_x: short = px + smooth;
	var p2_y: short = py + smooth;
	var p2_tile_x: short = p1_tile_x;
	var p2_tile_y: short = p1_tile_y;
	
	var p3_x: short = px - smooth;
	var p3_y: short = py - smooth;
	var p3_tile_x: short = p1_tile_x;
	var p3_tile_y: short = p1_tile_y;
	
	var p4_x: short = px + smooth;
	var p4_y: short = py - smooth;
	var p4_tile_x: short = p1_tile_x;
	var p4_tile_y: short = p1_tile_y;
	
	if (p1_x < 0)
	{
		if (preterrain1.tile_x > 0)
		{
			--p1_tile_x;
			--p3_tile_x;
			p1_x = (resolution-1)+p1_x;
			p3_x = p1_x;
			multi_terrain = true;
		}
		else 
		{
			p2_x -= p1_x;
			p4_x = p2_x;
			p1_x = 0;
			p3_x = p1_x;
		}
	}
	else if (p2_x > resolution-1)
	{
		if (preterrain1.tile_x < preterrain1.tiles.x-1)
		{
			++p2_tile_x;
			++p4_tile_x;
			p2_x -= (resolution-1);
			p4_x = p2_x;
			multi_terrain = true;
		}
		else 
		{
			p1_x -= (p2_x-(resolution-1));
			p3_x = p1_x;
			p2_x = resolution-1;
			p4_x = p2_x;
		}
	}
	if (p3_y < 0)
	{
		if (preterrain1.tile_z > 0)
		{
			--p3_tile_y;
			--p4_tile_y;
			p3_y = (resolution-1)+p3_y;			
			p4_y = p3_y;
			multi_terrain = true;
		}
		else
		{
			p1_y -= p3_y;
			p2_y = p1_y;
			p3_y = 0;
			p4_y = p3_y;
		}
	}
	else if (p1_y > resolution-1)
	{
		if (preterrain1.tile_z < preterrain1.tiles.y-1)
		{
			++p1_tile_y;
			++p2_tile_y;
			p1_y -= (resolution-1);
			p2_y = p1_y;
			multi_terrain = true;
		}
		else
		{
			p3_y -= (p1_y-(resolution-1));
			p4_y = p3_y;
			p1_y = (resolution-1);
			p2_y = p1_y;
		}
	}
	
	var point1: float;
	var point2: float;
	var point3: float;
	var point4: float;
	
	if (multi_terrain)
	{
		point1 = terrains[find_terrain(p1_tile_x,p1_tile_y)].terrain.terrainData.GetHeight(p1_x,p1_y);
		point2 = terrains[find_terrain(p2_tile_x,p2_tile_y)].terrain.terrainData.GetHeight(p2_x,p2_y);
		point3 = terrains[find_terrain(p3_tile_x,p3_tile_y)].terrain.terrainData.GetHeight(p3_x,p3_y);
		point4 = terrains[find_terrain(p4_tile_x,p4_tile_y)].terrain.terrainData.GetHeight(p4_x,p4_y);
	}
	else
	{
		point1 = preterrain1.terrain.terrainData.GetHeight(p1_x,p1_y);
		point2 = preterrain1.terrain.terrainData.GetHeight(p2_x,p2_y);
		point3 = preterrain1.terrain.terrainData.GetHeight(p3_x,p3_y);
		point4 = preterrain1.terrain.terrainData.GetHeight(p4_x,p4_y);
	}
		
	var low: float;
	var high: float;
	
    if (point1 > point2){high = point1;low = point2;} else {high = point2;low = point1;}
    if (point3 > high){high = point3;}
    if (point4 > high){high = point4;}
    
    if (point3 < low){low = point3;}
    if (point4 < low){low = point4;}
        
	var delta_y: float = Mathf.Round((high-low)*(101-settings.round_angle))/(101-settings.round_angle);
	var delta_x: float = (size.x/resolution)*((smooth*2.0)+1);
	
	var angle: float = Mathf.Atan(delta_y/delta_x)*Rad2Deg;
		
	return angle;
}

function find_terrain(tile_x: int,tile_y: int): int
{
	for (var count_terrain: int = 0;count_terrain < terrains.Count;++count_terrain)
	{
		if (terrains[count_terrain].tile_x == tile_x && terrains[count_terrain].tile_z == tile_y){return count_terrain;}
	}
	if (!generate_error)
	{
		Debug.Log("The order of the terrains has been changed! If you have more terrains please shift click <Fit All> in Terrain List -> Data -> Size.");
		generate_error = true;
		reset_terrains_tiles(script_base);
	}
	return 0;
}

function calc_terrain_needed_tiles()
{
	terrain_instances = Mathf.Pow(terrain_tiles,2)-(terrains.Count-1);
}

function calc_terrain_one_more_tile()
{
	terrain_tiles = terrains[0].tiles.x+1;
	calc_terrain_needed_tiles();
}

function find_terrain_by_name(terrain: Terrain):int
{
	var name: String = terrain.name;
	
	for (var count_terrain: int = 0;count_terrain < terrains.Count;++count_terrain)
	{
		if (terrains[count_terrain].terrain)
		{
			if (terrains[count_terrain].terrain.name == name){return count_terrain;}	
		}
	}
	return -1;
}

function reset_terrains_tiles(script_save: terraincomposer_save)
{
	for (var count_terrain: int = 0;count_terrain < terrains.Count;++count_terrain)
	{
		script_save.terrains[count_terrain].tiles = Vector2(1,1);
		script_save.terrains[count_terrain].tile_x = 0;
		script_save.terrains[count_terrain].tile_z = 0;
	}
}