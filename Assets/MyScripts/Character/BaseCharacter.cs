using UnityEngine;
using System.Collections;
using System;              //added to acces the enum class

public class BaseCharacter : MonoBehaviour 
{
	private string _name;
	private int _level;
	private uint _freeExp;
	
	private Attribute[] _primaryAttribute;
	private Vital[] _vital;
	private Skill[] _skill;
	
	public void Awake()
	{
		
		_name=string.Empty;
		_level=0;
		_freeExp=0;
		
		_primaryAttribute=new Attribute[Enum.GetValues(typeof(AttributeName)).Length];
		_vital=new Vital[Enum.GetValues(typeof(VitalName)).Length];
		_skill=new Skill[Enum.GetValues(typeof(SkillName)).Length];
		
		SetupPrimaryAttribute();
		SetupSkills();
		SetupVitals();
	}
	
	public string Name
	{
		get{return _name;}
		set{_name=value;}
	}
	
	public int Level
	{
		get{return _level;}
		set{_level=value;}
	}
	
	public uint FreeExp
	{
		get{return _freeExp;}
		set{_freeExp=value;}
	}
	
	public void AddExp(uint exp)
	{
		_freeExp+=exp;
		
		CalculateLevel();
	}
	
	//take avg of all of the players skills and assign that as the player leval
	public void CalculateLevel()
	{
		
	}
	
	public void SetupPrimaryAttribute()
	{
		for(int cnt=0;cnt<_primaryAttribute.Length;cnt++)
		{
			_primaryAttribute[cnt]=new Attribute();
		    _primaryAttribute[cnt].Name=((AttributeName)cnt).ToString();
		}
	}
	
	public void SetupVitals()
	{
		for(int cnt=0;cnt<_vital.Length;cnt++)
			_vital[cnt]=new Vital();
		
		SetupVitalModifiers();
	}
	
	public void SetupSkills()
	{
		for(int cnt=0;cnt<_skill.Length;cnt++)
			_skill[cnt]=new Skill();
		
		SetupSkillModifiers();
	}
	
	public Attribute GetPrimaryAttribute(int index)
	{
		return _primaryAttribute[index];
	}
	
	public Vital GetVital(int index)
	{
		return _vital[index];
	}
	
	public Skill GetSkill(int index)
	{
		return _skill[index];
	}
	
	private void SetupVitalModifiers()
	{
		//health
		GetVital((int)VitalName.Health).AddModifier(new ModifyingAttribute(GetPrimaryAttribute((int)AttributeName.Constitution), 10f));
		
		//mana
		GetVital((int)VitalName.Mana).AddModifier(new ModifyingAttribute(GetPrimaryAttribute((int)AttributeName.Intelligence),10));
		
		//attack
		GetVital((int)VitalName.Attack).AddModifier(new ModifyingAttribute(GetPrimaryAttribute((int)AttributeName.Might),1));
		
		//defence
		GetVital((int)VitalName.Defence).AddModifier(new ModifyingAttribute(GetPrimaryAttribute((int)AttributeName.Nimbleness),1));
	}
	
	private void SetupSkillModifiers()
	{
		//melee offence
		GetSkill((int)SkillName.Melee_Offence).AddModifier(new ModifyingAttribute(GetPrimaryAttribute((int)AttributeName.Might),.33f));
		GetSkill((int)SkillName.Melee_Offence).AddModifier(new ModifyingAttribute(GetPrimaryAttribute((int)AttributeName.Nimbleness),.33f));
		
	}
	
	public void StatUpdate()
	{
		for(int cnt=0;cnt<_vital.Length;cnt++)
			_vital[cnt].Update();
		for(int cnt=0;cnt<_skill.Length;cnt++)
			_skill[cnt].Update();
	}
	
}
