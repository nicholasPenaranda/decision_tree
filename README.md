# Decision Tree Technical Documentation

***

### Overview

This decision tree is created to aid Tier 1 technical support agents. The idea is to streamline the base of what is expected from Tier 1 agents. The current iteration contains trees for billing and technical support issues that involve Ubiquiti, Telrad, Mimosa, Cambium, and Tarana.

***

### How It works

	function resetPage() {
	  const inputs = document.getElementsByTagName("input");
	  for (let k = 0; k < inputs.length; k++) {
	    inputs[k].value = "";
	  }
	  for (let n = 0; n < document.querySelectorAll(".radioInfo").length; n++) {
	    document.querySelectorAll(".radioInfo")[n].style.display = "none";
	  }
	  issueTypeChange();
	  colorChange();
	  document.querySelector("textarea").value = "";
	  document.querySelector("#additionalOptions").style.cssText = "display:none;";
	  previousPrompts.innerHTML = "";
	  options.innerHTML = "";
	  createTicketButton.style.cssText = "display:none;";
	}

On load `resetPage()` is called at the end of the page to set the default stage of the page. First it looks for all inputs and sets their values to empty strings. Then it hides the inputs for radio stats. `issueTypeChange()` and `colorChange()` are currently redundant but are there in the case that reset should change eventually change the issue type, radio type, or complaint type selectors at the top of the page. Notes textbox is then set to an empty string. Additional options are hidden. HTML set up by the tree for the previous prompts and options are turned into empty strings. Lastly the create ticket button is then hidden.

	issueType.addEventListener("change", issueTypeChange);
	
	function issueTypeChange() {
	  const complaintStore = {
	    technicalSupport: [
	      { label: "No Connection", value: "noConnection" },
	      { label: "Intermittent Connection", value: "intermittentConnection" },
	      { label: "Slow Speeds", value: "slowSpeeds" },
	      { label: "Outage", value: "outage" }
	    ],
	    billing: [
	      { label: "Payment", value: "payment" },
	      { label: "Extension", value: "extension" },
	      { label: "Other", value: "other" }
	    ]
	  };
	  complaintType.innerHTML = "";
	  const tempIssue = complaintStore[issueType.value];
	  for (let j = 0; j < tempIssue.length; j++) {
	    const newOption = document.createElement("option");
	    const optionText = 	document.createTextNode(tempIssue[j].label);
	    newOption.value = tempIssue[j].value;
	    newOption.appendChild(optionText);
	    complaintType.appendChild(newOption);
	  }
	}

Whenever you change the value in the selector for issue type the `EventListener` for it fires off `issueTypeChange()`. This changes what is in the complaint type selector by setting the complaint type HTML to an empty string then looping new option values to be selected.

	selectButton.addEventListener("click", () => {
	  radioType = document.querySelector("#radioType").value;
	  let treeRef;
	  const radios = document.querySelectorAll(".radioInfo");
	
	  if (issueType.value === "technicalSupport") {
	    treeRef = tree[issueType.value][radioType][complaintType.value];
	  } else {
	    treeRef = tree.billing[complaintType.value];
	  }
	
	  for (let n = 0; n < radios.length; n++) {
	    radios[n].style.display = "none";
	  }
	
	  currentRadio = document.getElementById(radioType + "Radio");
	  complaintSelect = complaintType.value;
	
	  currentRadio.style.display = "grid";
	  intermittentRestored.style.cssText = "display:none;";
	  document.getElementById("additionalOptions").style.cssText = "display:block;";
	  previousPrompts.innerHTML = "";
	
	  selectHandler(treeRef.options, treeRef.prompt);
	});

When the `Select` button is pressed the global variables `radioType` is updated to the current value of the radio type selector, `currentRadio` is updated to the div containing the id that matches the radio type, and `complaintSelect` is updated to the current value of complaint type. The `currentRadio` is then made to appear. The additional option with the id `intermittentRestored` is hidden then the remaining additional options are set to appear. Just in case the page hasn't been reset the HTML for the previous prompts is set to an empty string. Last thing that happens is that the function `selectHandler(options, prompt, previous answer)` is set off.

	function selectHandler(node, text, previousOption = "") {
	  const tempNode = node;
	  const addingPrompt = document.createElement("li");
	  const textNode = document.createElement("span");
	  createTicketButton.style.cssText = "display:none;";
	
	  textNode.innerHTML = text;
	  textNode.addEventListener("mouseup", () => {
	    let bool = true;
	    while (bool) {
	      if (previousPrompts.lastChild.innerText.includes(text)) {
	        bool = false;
	      }
	      previousPrompts.lastChild.remove();
	    }
	    selectHandler(tempNode, text, previousOption);
	  });
	  addingPrompt.appendChild(textNode);
	  previousPrompts.appendChild(addingPrompt);
	  eventListenerCheck(text);
	  if (previousPrompts.lastChild.previousSibling) {
	    if (
	      !previousPrompts.lastChild.previousSibling
	        .querySelector("span")
	        .innerText.includes(previousOption)
	    ) {
	      previousPrompts.lastChild.previousSibling.querySelector(
	        "span"
	      ).innerText += previousOption;
	    }
	  }
	  options.innerHTML = "";
	  if (tempNode === "exit") {
	    createTicket();
	    return;
	  }
	  Object.keys(tempNode).forEach((key) => {
	    const optionElement = document.createElement("li");
	    const optionTextNode = document.createElement("span");
	    let temp = tempNode[key];
	    optionTextNode.appendChild(document.createTextNode(key));
	
	    if (key === "Create Ticket") {
	      createTicketButton.style.cssText = "display:block;";
	      return;
	    }
	    if (typeof tempNode[key] === "function") {
	      intermittentCheck();
	      temp = temp();
	    }
	
	    optionTextNode.addEventListener("click", () => {
	      if (temp === "exit") {
	        selectHandler(temp, "exit");
	        return;
	      }
	
	      selectHandler(temp.options, temp.prompt, " - " + key);
	    });
	
	    optionElement.appendChild(optionTextNode);
	    options.appendChild(optionElement);
	  });
	}

`selectHandler(options, prompt, previous answer)` is the main logic function for the page. It handles the decision tree from the start to finish. Local variables for the function are called with `tempNode` being a reference to the provided `node` argument, `addingPrompt` being the HTML list or `li` that sets the outer element for `textNode` which creates the element for the `span` element which holds the text for the previous prompts. A redundancy for hiding the create ticket button is set here as well.

The text from the `text` argument is added to `textNode`. There is then an `EventListener` which listens for a click erases any previous prompts below it and itself and calls `selectHandler()` to set its information up as the current prompt. `textNode` is then added to `addingPrompt` which is then added to the HTML element `previousPrompts`. `eventListenerCheck(prompt)` is fired off but will be explained further below in its own section. There is a check to see if there is a previous prompt and if it already contains the `previousOption` argument. If it doesn't it adds it to the previous prompt `span`. 

The `options` HTML element is cleared by setting it to an empty string. The if statment `if (tempNode === "exit")` is left in as redundancy from an older way to execute the `createTicket()` function. The options are created in a similar way as the prompts except the provided argument  `tempNode` is an object with multiple objects within itself. The loop creates the HTML just like with the prompts. It looks to see if the key is the string `Create Ticket` which will make the create ticket button visible. It checks to see if the current options is a function which will then run that function which is normally how I am jumping to other parts of the tree after initialization. During this check `intermittentCheck()` runs which just checks if `complaintType` value is intermittent connection which just makes the `intermittentRestored` option available. Once again, more redundant code with an `EventListener` for `optionTextNode` shows up that handled the old way to create tickets. Lastly in the loop the created HTML elements are added to the page.

	function eventListenerCheck(promptText) {
	  let currentElementId = null;
	  spanLastChild = previousPrompts.lastChild.querySelector("span");
	
	  switch (promptText) {
	    case "Kick the radio from the AP.":
	      currentElementId = "apKick";
	      break;
	    case "Ensure that the router is up to date on firmware and has optimal settings (if they instead only have a Motorolla mesh continue)":
	      currentElementId = "optimalRouter";
	      break;
	    case "Ensure that the router/mesh frequency isn't the same as the radio and then check ping and bandwidth from the router/mesh.":
	      currentElementId = "frequencyCheck";
	      break;
	    case "Power cycle the customers equipment.":
	      currentElementId = "powerCycle"
	      break;
	    default:
	      break;
	  }
	
	  if (currentElementId) {
	    spanLastChild.classList.toggle("popup");
	    spanLastChild.addEventListener("mousedown", () => {
	      if (spanLastChild.innerText !== promptText) {
	        return;
	      }
	      document.getElementById(currentElementId).style.cssText = "display:flex";
	    });
	  }
	}

The `eventListenerCheck()` looks to see if the current prompt matches any of the cases then ties an `EventListener` that makes specific popups visible. 

	function createTicket() {
	  let tempRadioType = radioType.split("");
	  tempRadioType[0] = tempRadioType[0].toUpperCase();
	  tempRadioType = tempRadioType.join("");
	  let tempComplaint = complaintType.value;
	  switch (tempComplaint) {
    case "noConnection":
      tempComplaint = "No Connection";
      break;
    case "intermittentConnection":
      tempComplaint = "Intermittent Connection";
      break;
    case "slowSpeeds":
      tempComplaint = "Slow Speeds";
      break;
    default:
      break;
	  }
	  let ticket = tempRadioType + "\n\n" + "Complaint: " + tempComplaint + "\n\n";
	  const currentRadio = document.getElementById(radioType + "Radio");
	  let currentLabel;
	  let currentInput;
	  let remoteSignal;
	  let currentId;
	  for (let m = 0; m < currentRadio.querySelectorAll("input").length; m++) {
	    currentInput = currentRadio.querySelectorAll("input")[m];
	    currentId = currentInput.id;
	    if (currentInput.value) {
	      if (currentInput.id === "remoteSignal") {
	        remoteSignal = currentInput.value;
	        continue;
	      } else if (currentId.includes("Chains")) {
	        if (currentId.includes("remote")) {
	          ticket += `Remote Signal: -${remoteSignal} Δ${currentInput.value}\n`;
	          continue;
	        } else {
	          ticket += ` Δ${currentInput.value}\n`;
	          continue;
	        }
	      }
	      currentLabel = findLabel(currentInput);
	      ticket += `${currentLabel}${
	        currentId.includes("signal") ||
	        currentId.includes("Signal") ||
	        currentId.includes("Noise")
	          ? " -"
	          : " "
	      }${currentInput.value}`;
	      switch (currentLabel) {
	        case "Ping:":
	          ticket += " ms";
	          break;
	        case "Bandwidth:":
	          ticket += " mbps";
	          break;
	        case "Pathloss:":
	          ticket += " dB";
	          break;
	        case "Radio Frequency:":
	        case "Router Frequency:":
	          ticket += " MHz";
	          break;
	        default:
	          break;
	      }
	      if (currentLabel === "Local Signal:") {
	        continue;
	      }
	      ticket += "\n";
	    }
	  }
	  ticket += "Troubleshooting List: \n\n";
	  for (let i = 0; i < previousPrompts.querySelectorAll("li").length; i++) {
	    ticket +=
	      previousPrompts.querySelectorAll("li")[i].querySelector("span")
	        .innerText + "\n";
	  }
	  ticket += "\nNotes:\n\n" + document.querySelector("#notes").value;
	  clipboardConfirm.style.display = "flex";
	  setTimeout(() => (clipboardConfirm.style.display = "none"), 5000);
	  return navigator.clipboard.writeText(ticket);
	}
	
	function findLabel(e) {
	  let idVal = e.id;
	  const labels = document.getElementsByTagName("label");
	  for (let i = 0; i < labels.length; i++) {
	    if (labels[i].htmlFor == idVal) return labels[i].innerHTML;
	  }
	}
	
`createTicket()` is fired off when the create ticket button is clicked. This function prints a string to the clipboard which should be formatted in the style of: 

	`radio type`
	
	Complaint: `complaint type`
	
	Troubleshooting List: 
	
	`previous prompts go here`
	
	Notes:
	
	`user created notes from the notes text area`

There may be a bit more formatting  that goes on depending on the `radio type`. During the function it does eventually call the `findLabel()` function which its purpose is just to find the input tied to a label element.

	const tree = {...}

`tree` is what holds all of the information, if not references to information, for the decision tree prompts and options. There is a style that should be followed if making changes to the tree. If creating a noConnection tab its good practice to make the options object keys functions so `intermittentCheck()` will function. If needing to point to a different part of the `tree` itself, you need a function as the key then return the part of the `tree` that you need to point to. The general formatting  for the tree is as follows: 

	tree: {
	  issueType: {
	    radioType: {
	      complaintType: {
		  prompt: "text",
		  options: {
		    option1: {...},
		    option2: {...},
		  },
		},
          },
	  },
	}

