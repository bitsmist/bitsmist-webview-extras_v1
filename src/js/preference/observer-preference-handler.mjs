// =============================================================================
/**
 * Bitsmist WebView - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

// =============================================================================
//	Observer preference handler class
// =============================================================================

export default class ObserverPreferenceHandler
{

	// -------------------------------------------------------------------------
	//  Constructor
	// -------------------------------------------------------------------------

	/**
     * Constructor.
     *
	 * @param	{String}		componentName		Component name.
	 * @param	{Object}		options				Options for the component.
     */
	constructor(componentName, options)
	{

		this._name = componentName;
		this._component = options["component"];
		this._options = options;

		this._targets = {};

		this.events = [
			"beforeSetup",
		]

	}

	// -------------------------------------------------------------------------
	//  Event handlers
	// -------------------------------------------------------------------------

	/**
	 * Load preference event handler.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
	 */
	beforeSetup(sender, e)
	{

		this.setup2(e.detail);

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Register target component.
	 *
	 * @param	{Component}		component			Component to notify.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	register(component, options)
	{

		this._targets[component.uniqueId] = {"object":component, "options":options};

	}

	// -------------------------------------------------------------------------

	/**
	 * Apply settings
	 *
	 * @param	{Object}		settings			Settings.
	 *
	 * @return  {Promise}		Promise.
	 */
	setup2(settings)
	{

		return new Promise((resolve, reject) => {
			let promises = [];

			Object.keys(this._targets).forEach((componentId) => {
				if (this.__isTarget(settings, this._targets[componentId].options["register"]))
				{
					promises.push(this._targets[componentId].object.setup(settings));
				}
			});

			Promise.all(promises).then(() => {
				resolve();
			});
		});

	}

	// -------------------------------------------------------------------------
	//	Private
	// -------------------------------------------------------------------------

	__isTarget(settings, target)
	{

		let result = false;

		/*
		if (target == "*")
		{
			return true;
		}
		*/

		for (let i = 0; i < target.length; i++)
		{
			if (settings["newPreferences"].hasOwnProperty(target[i]))
			{
				result = true;
				break;
			}
		}

		return result;

	}

}