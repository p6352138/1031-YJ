using UnityEngine;
using System.Collections;

public class GameSettings : MonoBehaviour {
	
	void Awake()
	{
		DontDestroyOnLoad (this);
	}
	
	void Update()
	{
		//LoadCharacterData();
	}
	
	public void SaveCharacterData()
	{
		GameObject pc=GameObject.Find("Player");
		
		PlayerCharacter pcClass=pc.GetComponent<PlayerCharacter>();
		
		PlayerPrefs.DeleteAll();
		
		PlayerPrefs.SetString("Player Name",pcClass.Name);
		
		for(int cnt=0;cnt<System.Enum.GetValues(typeof(AttributeName)).Length;cnt++)
		{
			PlayerPrefs.SetInt(((AttributeName)cnt).ToString()+"-Base Value",pcClass.GetPrimaryAttribute(cnt).BaseValue);
			PlayerPrefs.SetInt(((AttributeName)cnt).ToString()+"-Exp To Level",pcClass.GetPrimaryAttribute(cnt).ExpToLevel);
		}
		
		for(int cnt=0;cnt<System.Enum.GetValues(typeof(VitalName)).Length;cnt++)
		{
			PlayerPrefs.SetInt(((VitalName)cnt).ToString()+"-Base Value",pcClass.GetVital(cnt).BaseValue);
			PlayerPrefs.SetInt(((VitalName)cnt).ToString()+"-Exp To Level",pcClass.GetVital(cnt).ExpToLevel);
			PlayerPrefs.SetInt(((VitalName)cnt).ToString()+"-Cur Value",pcClass.GetVital(cnt).CurValue);
			
			PlayerPrefs.SetString(((VitalName)cnt).ToString()+"-Mods",pcClass.GetVital(cnt).GetModifyingAttrituesString());
		}	
	}
	
	public void LoadCharacterData()
	{
		GameObject pc=GameObject.Find("Player");
		
		PlayerCharacter pcClass=pc.GetComponent<PlayerCharacter>();
		
		pcClass.Name = PlayerPrefs.GetString("Player Name","Name Me");
		//Debug.Log(pcClass.Name);
		
		for(int cnt=0;cnt<System.Enum.GetValues(typeof(AttributeName)).Length;cnt++)
		{
			pcClass.GetPrimaryAttribute(cnt).BaseValue = PlayerPrefs.GetInt(((AttributeName)cnt).ToString()+"-Base Value",0);
			pcClass.GetPrimaryAttribute(cnt).ExpToLevel = PlayerPrefs.GetInt(((AttributeName)cnt).ToString()+"-Exp To Level",Attribute.STARTING_EXP_COST);
		}
		
		for(int cnt=0;cnt<System.Enum.GetValues(typeof(VitalName)).Length;cnt++)
		{
			
			pcClass.GetVital(cnt).BaseValue = PlayerPrefs.GetInt(((VitalName)cnt).ToString()+"-Base Value",0);
			pcClass.GetVital(cnt).ExpToLevel = PlayerPrefs.GetInt(((VitalName)cnt).ToString()+"-Exp To Level",0);
			
			pcClass.GetVital(cnt).Update();
			
			pcClass.GetVital(cnt).CurValue = PlayerPrefs.GetInt(((VitalName)cnt).ToString()+"-Cur Value",1);
			
		}

		
		for(int cnt=0;cnt<System.Enum.GetValues(typeof(AttributeName)).Length;cnt++)
		{
			//Debug.Log(((AttributeName)cnt).ToString() + ":" + pcClass.GetVital(cnt).CurValue);
		}
		
	}
	
}


