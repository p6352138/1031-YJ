
public class BaseStat
{
	public const int STARTING_EXP_COST = 100;
	
	private int _baseValue;      //the base value of this stat    
	private int _buffValue;      //the amount of the buff to this stat  
	private int _expToLevel;     //the total amount of exp needed to raise this skill 
	private float _levelModifier;//the modifer applied to the exp needed to raise the skill
	
	private string _name;
	
	public BaseStat(){
		_baseValue=0;
		_buffValue=0;
		_levelModifier=1.1f;
		_expToLevel=STARTING_EXP_COST;
		_name = "";
	}
	
	#region basic setters and getters
	//basic setters and getters
	public int BaseValue{
	 	get{return _baseValue;}
		set{_baseValue=value;}
	}
	
	public int BuffValue{
	 	get{return _baseValue;}
		set{_baseValue=value;}
	}
	
	public int ExpToLevel{
	 	get{return _expToLevel;}
		set{_expToLevel=value;}
	}
	
	public float LevelModifier{
	 	get{return _levelModifier;}
		set{_levelModifier=value;}
	}
	
	public string Name
	{
		get{return _name;}
		set{_name = value;}
	}
	
	#endregion
	
	private int CalculateExpToLevel()
	{
		return (int)( _expToLevel*_levelModifier);
	}
	
	public void LevelUp()
	{
		_expToLevel=CalculateExpToLevel();
		_baseValue++;
	}
	
	public int AdjustedBaseValue
	{
		get{return _baseValue+_buffValue;}
	}
	
}
