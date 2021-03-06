// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import FormUtil from '../util/form-util';

// =============================================================================
//	List class
// =============================================================================

// -----------------------------------------------------------------------------
//  Constructor
// -----------------------------------------------------------------------------

/**
 * Constructor.
 */
export default function List()
{

	return Reflect.construct(BITSMIST.v1.Pad, [], this.constructor);

}

BITSMIST.v1.ClassUtil.inherit(List, BITSMIST.v1.Pad);

// -----------------------------------------------------------------------------
//  Setter/Getter
// -----------------------------------------------------------------------------

/**
 * Row object.
 *
 * @type	{Object}
 */
Object.defineProperty(List.prototype, 'row', {
	get()
	{
		return this._row;
	},
})

// -----------------------------------------------------------------------------

/**
 * Data items.
 *
 * @type	{Object}
 */
Object.defineProperty(List.prototype, 'items', {
	get()
	{
		return this._items;
	},
	set(value)
	{
		this._items = value;
	}
})

// -----------------------------------------------------------------------------

/**
 * Raw data retrieved via api.
 *
 * @type	{Object}
 */
Object.defineProperty(List.prototype, 'data', {
	get()
	{
		return this._data;
	},
	set(value)
	{
		this._data= value;
	}
})

// -----------------------------------------------------------------------------
//  Event handlers
// -----------------------------------------------------------------------------

/**
 * After append event hadler.
 *
 * @param	{Object}		sender				Sender.
 * @param	{Object}		e					Event info.
 * @param	{Object}		ex					Extra event info.
 */
List.prototype.onListAfterAppend = function(sender, e, ex)
{

	this._listRootNode = this.querySelector(this._settings.get("settings.listRootNode"));
	let className = ( this._settings.get("components")[this._settings.get("settings.row")]["className"] ? this._settings.get("components")[this._settings.get("row")]["className"] : this._settings.get("settings.row"))
	this._row = BITSMIST.v1.ClassUtil.createObject(className);
	this._row._parent = this;

	return this._row.start();

}

// -----------------------------------------------------------------------------
//  Methods
// -----------------------------------------------------------------------------

/**
 * Start component.
 *
 * @param	{Object}		settings			Settings.
 *
 * @return  {Promise}		Promise.
 */
List.prototype.start = function(settings)
{

	// Init vars
	this._id;
	this._parameters;
	this._target = {};
	this._data;
	this._items;
	this._listRootNode;
	this._row;
	this._rows;

	// Init component settings
	settings = Object.assign({}, settings, {
		"events": {
			"this": {
				"handlers": {
					"afterAppend": [{
						"handler": this.onListAfterAppend
					}]
				}
			}
		}
	});

	// super()
	return BITSMIST.v1.Pad.prototype.start.call(this, settings);

}

// -----------------------------------------------------------------------------

/**
 * Clear list.
 */
List.prototype.clear = function()
{

	this._listRootNode.innerHTML = "";

}

// -----------------------------------------------------------------------------

/**
 * Fill list with data.
 *
 * @return  {Promise}		Promise.
 */
List.prototype.fill = function(options)
{

	console.debug(`List.fill(): Filling list. name=${this.name}`);

	options = Object.assign({}, options);
	let sender = ( options["sender"] ? options["sender"] : this );

	let rowAsync = BITSMIST.v1.Util.safeGet(options, "async", this._settings.get("settings.async", true));
	let builder = ( rowAsync ? this._buildAsync : this._buildSync );
	let fragment = document.createDocumentFragment();

	this._rows = [];
	this._target["id"] = ( "id" in options ? options["id"] : this._target["id"] );
	this._target["parameters"] = ( "parameters" in options ? options["parameters"] : this._target["parameters"] );

	return Promise.resolve().then(() => {
		if (BITSMIST.v1.Util.safeGet(options, "autoLoad", true))
		{
			return Promise.resolve().then(() => {
				return this.trigger("doTarget", this, {"target": this._target, "options":options});
			}).then(() => {
				return this.trigger("beforeFetch", sender, {"target": this._target, "options":options});
			}).then(() => {
				return this.trigger("doFetch", sender, {"target": this._target, "options":options});
			}).then(() => {
				return this.trigger("afterFetch", sender, {"target": this._target, "options":options});
			});
		}
	}).then(() => {
		return this.trigger("beforeFill", sender);
	}).then(() => {
		if (this._items)
		{
			return builder.call(this, fragment);
		}
	}).then(() => {
		let autoClear = BITSMIST.v1.Util.safeGet(options, "autoClear", this._settings.get("settings.autoClear"));
		if (autoClear)
		{
			this.clear();
		}
	}).then(() => {
		this._listRootNode.appendChild(fragment);
	}).then(() => {
		return this.trigger("afterFill", sender);
	});

}

// -----------------------------------------------------------------------------
//  Protected
// -----------------------------------------------------------------------------

/**
 * Build rows synchronously.
 *
 * @param	{DocumentFragment}	fragment		Document fragment.
 *
 * @return  {Promise}		Promise.
 */
List.prototype._buildSync = function(fragment)
{

	let chain = Promise.resolve();
	let rowEvents = this._row.settings.get("rowevents");
	let template = this._row._templates[this._row.settings.get("settings.templateName")].html;

	for (let i = 0; i < this._items.length; i++)
	{
		chain = chain.then(() => {
			return this.__appendRowSync(fragment, i, this._items[i], template, rowEvents);
		});
	}

	return chain;

}

// -----------------------------------------------------------------------------

/**
 * Build rows asynchronously.
 *
 * @param	{DocumentFragment}	fragment		Document fragment.
 */
List.prototype._buildAsync = function(fragment)
{

	let rowEvents = this._row.settings.get("rowevents");
	let template = this._row._templates[this._row.settings.get("settings.templateName")].html;

	for (let i = 0; i < this._items.length; i++)
	{
		this.__appendRowAsync(fragment, i, this._items[i], template, rowEvents);
	}

}

// -----------------------------------------------------------------------------
//  Privates
// -----------------------------------------------------------------------------

/**
 * Append a new row synchronously.
 *
 * @param	{HTMLElement}	rootNode				Root node to append a row.
 * @param	{integer}		no						Line no.
 * @param	{Object}		item					Row data.
 * @param	{String}		template				Template html.
 * @param	{Object}		clickHandler			Row's click handler info.
 * @param	{Object}		eventElements			Elements' event info.
 *
 * @return  {Promise}		Promise.
 */
List.prototype.__appendRowSync = function(rootNode, no, item, template, rowEvents)
{

	// Append a row
	let ele = document.createElement("div");
	ele.innerHTML = template;
	let element = ele.firstElementChild;
	rootNode.appendChild(element);

	this._rows.push(element);

	// set row elements click event handler
	if (rowEvents)
	{
		Object.keys(rowEvents).forEach((elementName) => {
			this._row.initEvents(elementName, rowEvents[elementName], element);
		});
	}

	// Call event handlers
	return Promise.resolve().then(() => {
		return this._row.trigger("beforeFillRow", this, {"item":item, "no":no, "element":element});
	}).then(() => {
		// Fill fields
		FormUtil.setFields(element, item, this.masters);
	}).then(() => {
		return this._row.trigger("afterFillRow", this, {"item":item, "no":no, "element":element});
	});

}

// -----------------------------------------------------------------------------

/**
 * Append a new row asynchronously.
 *
 * @param	{HTMLElement}	rootNode				Root node to append a row.
 * @param	{integer}		no						Line no.
 * @param	{Object}		item					Row data.
 * @param	{String}		template				Template html.
 * @param	{Object}		clickHandler			Row's click handler info.
 * @param	{Object}		eventElements			Elements' event info.
 */
List.prototype.__appendRowAsync = function(rootNode, no, item, template, rowEvents)
{

	// Append a row
	let ele = document.createElement("div");
	ele.innerHTML = template;
	let element = ele.firstElementChild;
	rootNode.appendChild(element);

	this._rows.push(element);

	// set row elements click event handler
	if (rowEvents)
	{
		Object.keys(rowEvents).forEach((elementName) => {
			this._row.initEvents(elementName, rowEvents[elementName], element);
		});
	}

	// Call event handlers
	this._row.triggerAsync("beforeFillRow", this, {"item":item, "no":no, "element":element});
	FormUtil.setFields(element, item, this.masters);
	this.row.triggerAsync("afterFillRow", this, {"item":item, "no":no, "element":element});

}
