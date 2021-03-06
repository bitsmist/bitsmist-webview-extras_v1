// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import FormatterUtil from './formatter-util';

// =============================================================================
//	Form util class
// =============================================================================

export default function FormUtil() {}

// -----------------------------------------------------------------------------
//  Methods
// -----------------------------------------------------------------------------

/**
 * Fill the form.
 *
 * @param	{HTMLElement}	rootNode			Form node.
 * @param	{Ojbect}		item				Values to fill.
 * @param	{Object}		masters				Master values.
 */
FormUtil.setFields = function(rootNode, item, masters)
{

	let fields = rootNode.querySelectorAll("[bm-bind]");
	let elements = Array.prototype.concat([rootNode], Array.prototype.slice.call(fields, 0));
	elements.forEach((element) => {
		let fieldName = element.getAttribute("bm-bind");
		if (fieldName in item)
		{
			if (element.hasAttribute("bm-master"))
			{
				let type = element.getAttribute("bm-master");
				let value = this.getMasterValue(masters, type, item[fieldName]);
				this.setValue(element, value);
			}
			else
			{
				this.setValue(element, item[fieldName]);
			}
		}
	});

}

// -----------------------------------------------------------------------------

/**
 * Get form values.
 *
 * @param	{HTMLElement}	rootNode			Form node.
 * @param	{String}		target				Target.
 *
 * @return  {Object}		Values.
 */
FormUtil.getFields = function(rootNode, target)
{

	let item = {};
	target = (target ? target : "");

	let elements = rootNode.querySelectorAll(target + " [bm-submit]");
	elements = Array.prototype.slice.call(elements, 0);
	elements.forEach((element) => {
		let key = element.getAttribute("bm-bind");
		let value = this.getValue(element);

		//if (value)
		{
			if (Array.isArray(item[key]))
			{
				if (value)
				{
					item[key].push(value);
				}
			}
			else if (item[key])
			{
				if (value)
				{
					let items = [];
					items.push(item[key]);
					items.push(value);
					item[key]= items;
				}
			}
			else
			{
				item[key] = value;
			}
		}
		/*
		else
		{
			item[key] = "";
		}
		*/
	});

	return item;

}

// -----------------------------------------------------------------------------

/**
 * Clear the form.
 *
 * @param	{HTMLElement}	rootNode			Form node.
 * @param	{String}		target				Target.
 */
FormUtil.clearFields = function(rootNode, target)
{

	target = (target ? target : "");

	let elements = rootNode.querySelectorAll(target + " input");
	elements = Array.prototype.slice.call(elements, 0);
	elements.forEach((element) => {
		switch (element.type.toLowerCase())
		{
		case "search":
		case "text":
		case "number":
			element.value = "";
			break;
		case "checkbox":
		case "radio":
			element.checked = false;
			break;
		}
	});

	elements = rootNode.querySelectorAll(target + " select");
	elements = Array.prototype.slice.call(elements, 0);
	elements.forEach((element) => {
		element.selectedIndex = -1;
	});

}

// -----------------------------------------------------------------------------

/**
 * Build the form.
 *
 * @param	{HTMLElement}	rootNode			Form node.
 * @param	{String}		target				Target.
 * @param	{Object}		item				Values to fill.
 */
FormUtil.buildFields = function(rootNode, fieldName, item)
{

	let elements = rootNode.querySelectorAll("[bm-bind='" + fieldName + "']");
	elements = Array.prototype.slice.call(elements, 0);
	elements.forEach((element) => {
		if (element.tagName.toLowerCase() == "select")
		{
			// Select
			element.options.length = 0;

			if ("emptyItem" in item)
			{
				let text = ( "text" in item["emptyItem"] ? item["emptyItem"]["text"] : "");
				let value = ( "value" in item["emptyItem"] ? item["emptyItem"]["value"] : "");
				let option = document.createElement("option");
				option.text = text;
				option.value = value;
				option.setAttribute("selected", "");
				element.appendChild(option);
			}

			Object.keys(item.items).forEach((id) => {
				let option = document.createElement("option");
				option.text = item.items[id]["title"];
				option.value = id;
				element.appendChild(option);
			});
		}
		else
		{
			// Radio
			Object.keys(item.items).forEach((id) => {
				let label = document.createElement("label");
				let option = document.createElement("input");
				option.type = "radio";
				option.id = key;
				option.name = key;
				option.value = id;
				option.setAttribute("bm-bind", key);
				option.setAttribute("bm-submit", "");
				label.appendChild(option);
				label.appendChild(document.createTextNode(item.items[id]["title"]));
				element.appendChild(label);
			});
		}
	});

}

// -----------------------------------------------------------------------------

/**
 * Get master value.
 *
 * @param	{array}			masters				Master values.
 * @param	{string}		type				Master type.
 * @param	{string}		code				Code value.
 *
 * @return  {string}		Master value.
 */
FormUtil.getMasterValue = function(masters, type, code)
{

	let ret = code;
	if (masters && (type in masters))
	{
		ret = masters[type].getValue(code);
	}

	return ret;

}

// -----------------------------------------------------------------------------

/**
 * Set value to the element.
 *
 * @param	{Object}		element				Html element.
 * @param	{string}		value				Value.
 */
FormUtil.setValue = function(element, value)
{

	if (value === null || value == undefined)
	{
		value = "";
	}

	// Format
	if (element.hasAttribute("bm-format"))
	{
		value = FormatterUtil.format("", element.getAttribute("bm-format"), value);
	}

	let sanitizedValue = FormatterUtil.sanitize(value);

	// Target
	let target = element.getAttribute("bm-target");
	if (target)
	{
		let items = target.split(",");
		for (let i = 0; i < items.length; i++)
		{
			let item = items[i].toLowerCase();
			switch (item)
			{
			case "html":
					element.innerHTML = value;
				break;
			case "href":
			case "src":
			case "rel":
				if (value.substring(0, 4) == "http" || value.substring(0, 1) == "/")
				{
					element.setAttribute(item, value);
				}
				break;
			default:
				let attr = element.getAttribute(item);
				attr = ( attr ? attr + " " + value : sanitizedValue );
				element.setAttribute(item, attr);
				break;
			}
		}
	}
	else
	{
		// Set value
		if (element.hasAttribute("value"))
		{
			if (
				(element.tagName.toLowerCase() == "input" && element.type.toLowerCase() == "checkbox") ||
				(element.tagName.toLowerCase() == "input" && element.type.toLowerCase() == "radio")
			)
			{
				if (Array.isArray(value))
				{
					if (value.indexOf(element.getAttribute("value")) > -1)
					{
						element.checked = true;
					}
				}
				else
				{
					if (element.getAttribute("value") == value)
					{
						element.checked = true;
					}
				}
			}
			else
			{
				element.setAttribute("value", FormatterUtil.sanitize(value))
			}
		}
		else if (element.tagName.toLowerCase() == "select")
		{
			element.value = value;
		}
		else if (element.tagName.toLowerCase() == "fieldset")
		{
		}
		else if (element.tagName.toLowerCase() == "input")
		{
			switch (element.type.toLowerCase())
			{
			case "number":
			case "search":
			case "text":
				element.value = value;
				break;
			case "checkbox":
				element.checked = ( value ? true : false );
				break;
			case "radio":
				if (element.value == value)
				{
					element.checked = true;
				}
				break;
			}
		}
		else
		{
			element.innerText = value;
		}
	}

	// Trigger change event
	let e = document.createEvent("HTMLEvents");
	e.initEvent("change", true, true);
	element.dispatchEvent(e);

}

// -----------------------------------------------------------------------------

/**
 * Get value from the element.
 *
 * @param	{Object}		element				Html element.
 *
 * @return  {string}		Value.
 */
FormUtil.getValue = function(element)
{

	let ret = undefined;

	switch (element.tagName.toLowerCase())
	{
	case "input":
		switch (element.type.toLowerCase())
		{
		case "radio":
		case "checkbox":
			if (element.checked)
			{
				ret = ( element.hasAttribute("value") ? element.getAttribute("value") : element.checked );
			}
			break;
		default:
			ret = element.value;
			break;
		}
		break;
	case "select":
		// todo:multiselect
		ret = element.value;
		break;
	default:
		if (element.hasAttribute("selected"))
		{
			ret = element.getAttribute("value");
		}
		break;
	}

	// Deformat
	if (element.hasAttribute("bm-format"))
	{
		ret = BITSMIST.v1.FormatterUtil.deformat("", element.getAttribute("bm-format"), ret);
	}

	return ret;

}

// -----------------------------------------------------------------------------

/**
 * Report validity of the form.
 *
 * @param	{HTMLElement}	rootNode			Root node to check.
 *
 * @return  {Boolean}		True:OK, False:NG.
 */
FormUtil.reportValidity = function(rootNode)
{

	let ret = true;

	let elements = rootNode.querySelectorAll("input")
	elements = Array.prototype.slice.call(elements, 0);
	elements.forEach((element) => {
		let type = element.getAttribute("type");
		switch (type)
		{
			case "number":
				console.error(element.validity);
				if ((element.validity && element.validity.valid == false) || isNaN(element.value))
				{
					element.style.border = "solid 3px red";
					ret = false;
				}
				break;
		}
	});

	return ret;

}
