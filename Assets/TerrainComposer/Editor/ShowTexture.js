#pragma strict

class ShowTexture extends EditorWindow
{
	var texture: Texture2D;
		
	static function ShowWindow () 
	{
    	var window = EditorWindow.GetWindow (ShowTexture);
        window.title = "Preview";
    }
    
 	function OnGUI()
	{
		if (texture)
		{
			EditorGUI.DrawPreviewTexture(Rect(0,0,512,512),texture);
		}
	}
}