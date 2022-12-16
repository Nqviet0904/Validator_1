const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
// Đối tương Validator
function Validator(options) {
  function getParent(element, selector) {
    while (element.parentElement) {
      if (element.parentElement.matches(selector)) {
        return element.parentElement;
      }
      element = element.parentElement;
    }
  }
  var selectorRules = {};
  // Hàm thực hiện validate
  function validate(inputElement, rule) {
    var errorElement = getParent(
      inputElement,
      options.formGroupSelector
    ).querySelector(options.errorSelector);
    var errorMessage;
    // Lấy ra các rule của selector
    var rules = selectorRules[rule.selector];
    // lặp qua từng rule và kiểm tra
    // nếu mà có lỗi thì dừng việc kiểm tra
    for (var i = 0; i < rules.length; i++) {
      switch (inputElement.type) {
        case "radio":
        case "checkbox":
          errorMessage = rules[i](
            formElement.querySelector(rule.selector + ":checked")
          );
          break;
        default:
          errorMessage = rules[i](inputElement.value);
      }
      if (errorMessage) break;
    }
    if (errorMessage) {
      errorElement.innerText = errorMessage;
      getParent(inputElement, options.formGroupSelector).classList.add(
        "invalid"
      );
    } else {
      errorElement.innerText = "";
      getParent(inputElement, options.formGroupSelector).classList.remove(
        "invalid"
      );
    }
    return !errorMessage;
  }
  // lấy Element của form  cần validate
  var formElement = document.querySelector(options.form);
  if (formElement) {
    // Khi submit form
    formElement.onsubmit = function (e) {
      e.preventDefault();
      var isFormValid = true;
      options.rules.forEach(function (rule) {
        var inputElement = formElement.querySelector(rule.selector);
        var isValid = validate(inputElement, rule);
        if (!isValid) {
          isFormValid = false;
        }
      });
      if (isFormValid) {
        // trường hợp submit với javascript
        if (typeof options.onSubmit === "function") {
          var enableInput = formElement.querySelectorAll(
            "[name]:not([disable])"
          );
          var formValues = Array.from(enableInput).reduce(function (
            values,
            input
          ) {
            // values[input.name] = input.value;
            switch (input.type) {
              case "radio":{
                if (input.matches(":checked")) {
                  values[input.name] = input.value;
                }
                break;
              }
              case "checkbox": {
                if (!input.matches(":checked")) {
                  values[input.name]= '';
                  return values;
                }
                if(!Array.isArray(values[input.name])){
                  values[input.name]= [];
                }
                values[input.name].push(input.value);
                break;
              }
              case 'file':{
                values[input.name]=input.file;
                break;
              }
              default:
                values[input.name] = input.value;
            }
            return values;
          },
          {});
          // console.log(formValues);
          options.onSubmit(formValues);
        }
        // Trường hợp submit với hành vi mặc định
        else {
          formElement.submit();
        }
      }
      // if (isFormValid) {
      //   // Xuat du lieu nguoi dung nhap ra console.log
      //   if (typeof options.onSubmit === "function") {
      //     var enableInputs = formElement.querySelectorAll("[name]:not([disabled])");
      //     var resultInput = Array.from(enableInputs).reduce(function(values,input) {
      //       switch (input.type) {
      //         case "radio":
      //           // Lap qua tung input, nếu input được checked thì gán giá trị input cho key values[input.name]
      //           if (input.checked) {
      //             values[input.name] = input.value;
      //           }
      //           // Kiem tra key values[input.name] nếu không có gì thì gán cho chuỗi rỗng
      //           if (!values[input.name]) {
      //             values[input.name] = "";
      //           }
      //           break;
      //         case "checkbox":
      //           if (input.checked) {
      //             // Kiểm tra mảng values[input.name] có phải mảng rỗng ko
      //             // Nêu ko thì push thêm phần tử
      //             // Nếu là mảng rỗng thì tạo mảng có chứ 1 phần tử là input.value
      //             if (Array.isArray(values[input.name])) {
      //               values[input.name].push(input.value);
      //             } else {
      //               values[input.name] = [input.value];
      //             }
      //           }
      //           // Kiểm tra key values[input.name] nếu không có gì thì gắn cho mảng rỗng
      //           if (!values[input.name]) {
      //             values[input.name] = [];
      //           }
      //           break;
      //         default:
      //           values[input.name] = input.value;
      //       }
      //       return values;
      //     },
      //     {});
      //     options.onSubmit(resultInput);
      //   } else {
      //     formElement.submit();
      //   }
      // }
    };
    // Lặp qua mỗi rule và xử lí (lắng nghe sự kiện blur,input ,..)
    options.rules.forEach((rule) => {
      // Lưu các rule của mỗI input
      if (Array.isArray(selectorRules[rule.selector])) {
        selectorRules[rule.selector].push(rule.test);
      } else {
        selectorRules[rule.selector] = [rule.test];
      }
      var inputElements = formElement.querySelectorAll(rule.selector);
      Array.from(inputElements).forEach(function (inputElement) {
        if (inputElement) {
          // Xử lí trường hợp blur ra ngoài
          inputElement.onblur = function () {
            validate(inputElement, rule);
          };
          // Xử lí trường hợp nhập vào input
          inputElement.oninput = function () {
            var errorElement = getParent(
              inputElement,
              options.formGroupSelector
            ).querySelector(options.errorSelector);
            errorElement.innerText = "";
            getParent(inputElement, options.formGroupSelector).classList.remove(
              "invalid"
            );
          };
        }
      });
    });
  }
}
// Định nghĩa Rules
// Nguyên tắc của các rules:
// 1.Khi có lỗi => trả ra message lỗi
//2. Khi hợp lệ => Không trả về gì cả (undefined)
Validator.isRequired = function (selector, message) {
  return {
    selector: selector,
    test: function (value) {
      return value ? undefined : message || "Vui lòng nhập trường này";
    },
  };
};
Validator.isEmail = function (selector) {
  return {
    selector: selector,
    test: function (value) {
      var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      return regex.test(value) ? undefined : "Trường này phải là email";
    },
  };
};
Validator.minLength = function (selector, min) {
  return {
    selector: selector,
    test: function (value) {
      return value.length >= min
        ? undefined
        : `Vui lòng nhập tối thiêu ${min} ký tự`;
    },
  };
};
Validator.isCofirmed = function (selector, getConfirmValue, message) {
  return {
    selector: selector,
    test: function (value) {
      return value === getConfirmValue()
        ? undefined
        : message || "Giá trị nhập vào không chính xác";
    },
  };
};
