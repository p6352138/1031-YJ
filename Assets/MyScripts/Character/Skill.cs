
public class Skill : ModifiedStat 
{
	private bool _know;
	
	public Skill()
	{
		_know=false;
		ExpToLevel=25;
		LevelModifier=1.1f;
	}
	
	public bool Know
	{
		get{return _know;}
		set{_know=value;}
	}
}

public enum SkillName{
	Melee_Offence,   //混乱
	Melee_Defence,
	Ranged_Offence,  //射箭
	Ranged_Defence,
	Magic_Offence,   //魔法
	Magic_Defence
}