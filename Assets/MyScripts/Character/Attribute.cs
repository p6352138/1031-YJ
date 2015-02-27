
public class Attribute : BaseStat 
{
	new public const int STARTING_EXP_COST = 50;
	
	
    public Attribute()
	{
		ExpToLevel = STARTING_EXP_COST;
		LevelModifier = 1.05f;
	}
}

public enum AttributeName{
	Might,          
	Constitution, 
	Intelligence,
	Nimbleness,           
}

