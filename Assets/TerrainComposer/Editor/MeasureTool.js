#pragma strict

class MeasureTool extends EditorWindow
{
	var TerrainComposer_Scene: GameObject;
	var tc_script: TerrainComposer;
	var script: terraincomposer_save;
	
	var undock: boolean = true;
	
	static function ShowWindow () 
	{
    	var window = EditorWindow.GetWindow (MeasureTool);
        window.title = "MeasureTool";
    }
    
    function OnFocus()
	{
		TerrainComposer_Scene = GameObject.Find("TerrainComposer");
		if (TerrainComposer_Scene)
		{
			script = TerrainComposer_Scene.GetComponent(terraincomposer_save);
		}
		
		if (!tc_script)
		{
			if (script){tc_script = EditorUtility.InstanceIDToObject(script.tc_id) as TerrainComposer;}
		}
	}
	
	function OnDestroy()
	{
		if (undock && script){script.measure_tool = false;script.measure_tool_active = false;}
		if (tc_script){tc_script.Repaint();}
	}
	
	function OnGUI()
	{
		if (EditorApplication.isPlaying){return;}
		if (!tc_script || !script){OnFocus();return;}
		tc_script.draw_measure_tool();
		
		if (script.measure_tool_active){this.Repaint();}
	}
}