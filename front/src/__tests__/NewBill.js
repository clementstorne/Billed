/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";

import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  beforeAll(() => {
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
    });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
      })
    );

    const root = document.createElement("div");
    root.setAttribute("id", "root");
    document.body.append(root);
    root.innerHTML = NewBillUI();

    router();
    window.onNavigate(ROUTES_PATH.NewBill);
  });

  describe("When I am on NewBill Page", () => {
    test("Then mail icon in vertical layout should be highlighted", () => {
      const mailIcon = screen.getByTestId("icon-mail");
      expect(mailIcon.getAttribute("class")).toMatch("active-icon");
    });

    test("Then the new bill form should be displayed", () => {
      const newBillForm = screen.getByTestId("form-new-bill");
      expect(newBillForm).toBeTruthy();
    });

    test("Then the expense type input should be displayed", () => {
      const expenseTypeInput = screen.getByTestId("expense-type");
      expect(expenseTypeInput).toBeTruthy();
    });

    test("Then the expense name input should be displayed", () => {
      const expenseNameInput = screen.getByTestId("expense-name");
      expect(expenseNameInput).toBeTruthy();
    });

    test("Then the date picker should be displayed", () => {
      const datePicker = screen.getByTestId("datepicker");
      expect(datePicker).toBeTruthy();
    });

    test("Then the amount input should be displayed", () => {
      const amountInput = screen.getByTestId("amount");
      expect(amountInput).toBeTruthy();
    });

    test("Then the VAT input should be displayed", () => {
      const vatInput = screen.getByTestId("vat");
      expect(vatInput).toBeTruthy();
    });

    test("Then the PCT input should be displayed", () => {
      const pctInput = screen.getByTestId("pct");
      expect(pctInput).toBeTruthy();
    });

    test("Then the commentary textarea should be displayed", () => {
      const commentaryTextarea = screen.getByTestId("commentary");
      expect(commentaryTextarea).toBeTruthy();
    });

    test("Then the file input should be displayed", () => {
      const fileInput = screen.getByTestId("file");
      expect(fileInput).toBeTruthy();
    });

    describe("And I add an image file", () => {
      test("Then the filename should be displayed in the input", () => {
        const store = mockStore;
        const newBill = new NewBill({
          document,
          onNavigate,
          store,
          localStorage,
        });

        const fileInput = screen.getByTestId("file");

        const handleChangeFile = jest.fn(newBill.handleChangeFile);
        fileInput.addEventListener("change", handleChangeFile);
        fireEvent.change(fileInput, {
          target: {
            files: [new File(["test"], "test.png", { type: "image/png" })],
          },
        });

        expect(handleChangeFile).toHaveBeenCalled();
        expect(fileInput.files[0].type).toBe("image/png");
        expect(fileInput.files[0].name).toBe("test.png");
      });
    });

    describe("And I add a file with invalid format", () => {
      test("Then an error message should be displayed", () => {
        const store = mockStore;
        const newBill = new NewBill({
          document,
          onNavigate,
          store,
          localStorage,
        });

        const fileInput = screen.getByTestId("file");

        const handleChangeFile = jest.fn(newBill.handleChangeFile);
        fileInput.addEventListener("change", handleChangeFile);
        fireEvent.change(fileInput, {
          target: {
            files: [new File(["test"], "test.mp4", { type: "media/mp4" })],
          },
        });

        expect(handleChangeFile).toHaveBeenCalled();
        expect(
          screen.getByText(
            "Seuls les justificatifs au format JPEG, JPG ou PNG sont acceptés."
          )
        ).toBeTruthy();
      });
    });

    describe("And an error message for invalid file format is displayed, I add an image file", () => {
      test("Then the error message should disappear", () => {
        const store = mockStore;
        const newBill = new NewBill({
          document,
          onNavigate,
          store,
          localStorage,
        });

        const errorMessage = document.createElement("div");
        errorMessage.classList.add("error-message");
        errorMessage.innerHTML =
          "Seuls les justificatifs au format JPEG, JPG ou PNG sont acceptés.";
        const fileInput = screen.getByTestId("file");
        fileInput.parentNode.appendChild(errorMessage);

        const handleChangeFile = jest.fn(newBill.handleChangeFile);
        fileInput.addEventListener("change", handleChangeFile);
        fireEvent.change(fileInput, {
          target: {
            files: [new File(["test"], "test.png", { type: "image/png" })],
          },
        });

        expect(handleChangeFile).toHaveBeenCalled();
        expect(root.innerHTML).not.toMatch(
          "Seuls les justificatifs au format JPEG, JPG ou PNG sont acceptés."
        );
      });
    });

    // Test d'intégration POST
    describe("And I fill the form and submit", () => {
      test("Then bill should be added to API POST", () => {
        const store = mockStore;
        const newBill = new NewBill({
          document,
          onNavigate,
          store,
          localStorage,
        });

        const expenseTypeInput = screen.getByTestId("expense-type");
        fireEvent.change(expenseTypeInput, { target: { value: "Transports" } });

        const expenseNameInput = screen.getByTestId("expense-name");
        fireEvent.change(expenseNameInput, {
          target: { value: "Billets de train" },
        });

        const datePicker = screen.getByTestId("datepicker");
        fireEvent.change(datePicker, { target: { value: "2023-01-01" } });

        const amountInput = screen.getByTestId("amount");
        fireEvent.change(amountInput, { target: { value: "314" } });

        const vatInput = screen.getByTestId("vat");
        fireEvent.change(vatInput, { target: { value: "63" } });

        const pctInput = screen.getByTestId("pct");
        fireEvent.change(pctInput, { target: { value: "251" } });

        const commentaryTextarea = screen.getByTestId("commentary");
        fireEvent.change(commentaryTextarea, {
          target: { value: "Réunion à Paris" },
        });

        const fileInput = screen.getByTestId("file");

        const handleChangeFile = jest.fn(newBill.handleChangeFile);
        fileInput.addEventListener("change", handleChangeFile);
        fireEvent.change(fileInput, {
          target: {
            files: [new File(["test"], "test.png", { type: "image/png" })],
          },
        });

        const handleSubmit = jest.fn(newBill.handleSubmit);
        const newBillForm = screen.getByTestId("form-new-bill");
        newBillForm.addEventListener("submit", handleSubmit);
        fireEvent.submit(newBillForm);

        expect(handleSubmit).toHaveBeenCalled();
      });
    });
  });
});
