"use strict";

//Store all DOM elements for manipulation
const nextStepButton = document.getElementById("next");
const prevStepButton = document.getElementById("back");
const asideListIndexes = document.querySelectorAll(".list--index");
const stepOneForm = document.querySelector("#step--1--form");
const allInputFields = stepOneForm.querySelectorAll("input");
const allErrorBoxes = document.querySelectorAll(".error__msg");
const allSteps = document.querySelectorAll(".step");
const billContainer = document.querySelector(".billing--container");
const allBillTypes = document.querySelectorAll(".bill--box");
const billDurCheckbox = document.getElementById("bill-duration");
const allAddOns = document.querySelectorAll(".addon");
const addOnContainer = document.querySelector(".addons--container");
const totalDiv = document.getElementById("total");
const summaryContainer = document.querySelector(".summary--container");

let currentStep = 1;

//determines the cost of the addons based on the duration selected
const detAddonCost = function (i) {
  return checkout.duration === "yr" ? [10, 20, 20][i] : [1, 2, 2][i];
};
const checkout = {
  duration: "mo",
  planType: "arcade",
  planTypeIndex: 0,
  planCost() {
    return this.duration === "yr" ? [90, 120, 150] : [9, 12, 15];
  },
  addonsObj: {
    online_service: [false, "Online service", detAddonCost.bind({}, 0)],
    larger_storage: [false, "Larger storage", detAddonCost.bind({}, 1)],
    custom_profile: [false, "Customizable Profile", detAddonCost.bind({}, 2)],
  },
};

const prevButtonVis = function (visible) {
  if (visible) {
    prevStepButton.classList.remove("hidden");
    prevStepButton.parentElement.classList.add("reverse");
  } else {
    prevStepButton.classList.add("hidden");
    prevStepButton.parentElement.classList.remove("reverse");
  }
};

//Function for page 1
function stepOne() {
  //Regexes/Function to help verify inputs
  prevButtonVis(false);
  const stripOffSpace = (str) => str.replace(/ /g, "");
  const regexStringOnly = /[\p{L}]/gu;
  const regexPhoneNumber = /\+{1}[\p{N}]{10}/gu;

  const updateErrors = function (elem, text) {
    elem.closest("label").querySelector("input").classList.add("error_outline");
    elem.classList.remove("hidden");
    elem.textContent = text;
  };

  const resetErrors = function () {
    allErrorBoxes.forEach((el) => {
      //reset inputs border and error boxes
      el.textContent = "";
      el.classList.add("hidden");
      el.closest("label")
        .querySelector("input")
        .classList.remove("error_outline");
    });
  };

  //This Symbol.split object allows the String.split method to split a string in a type of phone number format
  const splitByNum = {
    [Symbol.split](str) {
      let counter = 0;
      let num = 2;
      let pos = 0;

      const result = [];
      while (pos < str.length) {
        const groupMatch = str.slice(pos, pos + num);
        if (pos + num >= str.length) {
          result.push(groupMatch);
          break;
        }
        result.push(groupMatch);
        pos += num;
        counter++;
        num = counter > 0 ? 3 : 2;
      }
      return result;
    },
  };

  const checkPhoneNum = function (el, strVal, errBox) {
    if (strVal.replace(regexPhoneNumber, "") !== "") {
      updateErrors(errBox, "Invalid Format");
      return true;
    }
    el.value = strVal.split(splitByNum).join(" ");
  };

  const errorCheck = function () {
    resetErrors();
    for (let i = 0; i < allInputFields.length; i++) {
      const elem = allInputFields[i];
      const stripElemText = stripOffSpace(elem.value);
      const elemErrorBox = elem.closest("label").querySelector(".error__msg");
      const elemDataType = elem.dataset.lit;

      if (elemErrorBox.textContent !== "") return;

      if (stripElemText === "") {
        updateErrors(elemErrorBox, "This field is required");
        return true;
      }

      switch (true) {
        case elemDataType === "name":
          if (stripElemText.replace(regexStringOnly, "") !== "") {
            updateErrors(elemErrorBox, "Invalid Format");
            return true;
          }
          break;
        case elemDataType === "email":
          if (elem.matches(":invalid")) {
            updateErrors(elemErrorBox, "Invalid Format");
            return true;
          }
          break;
        case elemDataType === "num_phone":
          return checkPhoneNum(elem, stripElemText, elemErrorBox);
        default:
          break;
      }
    }
  };

  //remove red outline while typing
  stepOneForm.addEventListener("input", function (e) {
    if (e.target.tagName === "INPUT") resetErrors();
  });

  return errorCheck() ? false : true;
}

const updateDuration = function (elem, dur, i, step) {
  if (step === 2) {
    //.classlist remove or add using bracket notation and template literal
    elem
      .querySelector(".plan--bonus")
      .classList[`${dur === "yr" ? "remove" : "add"}`]("hidden");

    //Update plan's cost from object

    elem.querySelector(".plan--cost").textContent = `$${
      checkout.planCost()[i]
    }/${checkout.duration}`;
  } else if (step === 3) {
    elem.querySelector(".addon--cost").textContent = `$${detAddonCost(i)}/${
      checkout.duration
    }`;
  }
};

function stepTwo() {
  const updateBills = function (dur) {
    for (let i = 0; i < allBillTypes.length; i++) {
      const elem = allBillTypes[i];

      updateDuration(elem, dur, i, 2);
    }
  };

  billDurCheckbox.addEventListener("input", function (e) {
    const checBoxStatus = this.checked;
    checkout.duration = checBoxStatus ? "yr" : "mo";
    updateBills(checkout.duration);
  });

  billContainer.addEventListener("click", function (e) {
    if (!e.target.closest(".bill--box")) return;
    const target = e.target.closest(".bill--box");

    allBillTypes.forEach((el, i) => {
      if (el === target) {
        el.classList.add("active");
        checkout.planType = el.querySelector("p").textContent.toLowerCase();
        checkout.planTypeIndex = i;
      } else {
        el.classList.remove("active");
      }
    });
  });
  return true;
}

//Function for Step 3
function stepThree() {
  for (let i = 0; i < allAddOns.length; i++) {
    const elem = allAddOns[i];
    updateDuration(elem, checkout.duration, i, 3);
  }
  addOnContainer.addEventListener("input", function (e) {
    const target = e.target;
    if (!target.closest(".addon")) return;
    //change background on click
    target.parentElement.style.backgroundColor = target.checked
      ? "var(--alabaster)"
      : "";
    checkout.addonsObj[`${target.id}`][0] = target.checked;
  });
  return;
}

const formatNextButton = function (style) {
  if (style !== "default") {
    nextStepButton.textContent = "Confirm";
    nextStepButton.classList.add("confirm");
  } else {
    nextStepButton.textContent = "Next Step";
    nextStepButton.classList.remove("confirm");
  }
};
//Function for Step 4
function stepFour() {
  summaryContainer.innerHTML = "";
  const selectedAddons = Object.values(checkout.addonsObj).filter(
    (arr) => arr[0]
  );
  console.log(selectedAddons);

  const updateSummary = function () {
    const planCost = checkout.planCost()[checkout.planTypeIndex];
    const dur = checkout.duration;
    const cartItem1 = `<div class="cart--item cart--item--1 duration"><div class="cart--item--info active">
    <p>${checkout.planType} (${dur === "mo" ? "Monthly" : "Yearly"})</p>
    <a href="#" id="change" class="light__faint__style">Change</a>
  </div>
  <span class="cart--item--price cart--item--price--1">$${planCost}/${dur}</span>
  </div></div><div id="thin--line"></div>`;

    let total = planCost;

    summaryContainer.insertAdjacentHTML("beforeend", cartItem1);

    for (let i = 0; i < selectedAddons.length; i++) {
      const addonArr = selectedAddons[i];
      const addOnCostPrice = addonArr[2]();
      const otherCartItem = `<div class="cart--item light__faint__style">
  <div class="cart--item--info ">
    <p>${addonArr[1]}</p>
  </div>
  <span class="cart--item--price cart--item--price--2">+$${addOnCostPrice}/${dur}</span>
</div>
`;
      summaryContainer.insertAdjacentHTML("beforeend", otherCartItem);
      total += addOnCostPrice;
    }

    totalDiv.children[0].textContent = `Total (per ${
      dur === "mo" ? "month" : "year"
    })`;
    totalDiv.children[1].textContent = `${
      dur === "mo" ? "+" : ""
    }$${total}/${dur}`;
    return;
  };
  updateSummary();

  const changeLink = document.getElementById("change");
  changeLink.addEventListener("click", (e) => {
    e.preventDefault();
    navigateSteps("backward", 2);
  });
  formatNextButton("confirm");
  return;
}

const stepFive = function () {
  console.log("Yay!!");
};

const selectStep = function (curStep) {
  formatNextButton("default");
  prevStepButton.parentElement.classList.remove("hidden");
  allSteps.forEach((el, i) => {
    if (el.classList.contains(`step--${curStep}`)) {
      el.classList.remove("hidden");
    } else el.classList.add("hidden");

    //Change navigation Button visibility based on step number
    if (curStep === 1) prevButtonVis(false);
    else if (curStep === 5) {
      prevStepButton.parentElement.classList.add("hidden");
    } else prevButtonVis(true);

    //Change active aside index
    if (curStep !== 5 && i !== 4) {
      let asideEl = asideListIndexes[i];

      if (asideEl.classList.contains(`list--index--${curStep}`)) {
        asideEl.classList.add("active");
      } else asideEl.classList.remove("active");
    }
  });
  return;
};

const navigateSteps = function (dir, stepSpecific, e) {
  if (dir === "backward") {
    currentStep = stepSpecific ? stepSpecific : currentStep - 1;
    console.log(stepSpecific, currentStep);
    selectStep(currentStep);
    return;
  }
  switch (currentStep) {
    case 1:
      if (stepOne()) {
        currentStep++;
        selectStep(currentStep);
        stepTwo();
      } else return;
      break;
    case 2:
      currentStep++;
      selectStep(currentStep);
      stepThree();
      break;
    case 3:
      currentStep++;
      selectStep(currentStep);
      stepFour();
      break;
    case 4:
      currentStep++;
      selectStep(currentStep);
      stepFive();
      break;

    default:
      break;
  }
  return;
};

nextStepButton.addEventListener(
  "click",
  navigateSteps.bind({}, "forward", undefined)
);
prevStepButton.addEventListener(
  "click",
  navigateSteps.bind({}, "backward", undefined)
);

//reset all checkboxes on page reload
const allCheckboxes = document.querySelectorAll('input[type="checkbox" i]');
allCheckboxes.forEach((el) => (el.checked = false));
