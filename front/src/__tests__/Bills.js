/**
 * @jest-environment jsdom
 */

import { screen, waitFor, fireEvent } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import Bills from "../containers/Bills.js";
import { bills } from "../fixtures/bills.js";
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
  });

  beforeEach(() => {
    const root = document.createElement("div");
    root.setAttribute("id", "root");
    document.body.append(root);

    router();
    window.onNavigate(ROUTES_PATH.Bills);
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      window.onNavigate(ROUTES_PATH.Bills);

      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      expect(windowIcon.getAttribute("class")).toMatch("active-icon");
    });

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });

    describe("And I click on the Eye Icon", () => {
      test("A modal should open", () => {
        document.body.innerHTML = BillsUI({ data: bills });

        $.fn.modal = jest.fn();
        const eyeIcon = screen.getAllByTestId("icon-eye")[0];
        const modal = document.getElementById("modaleFile");

        const bill = new Bills({
          document,
          onNavigate,
          mockStore,
          localStorage,
        });

        const handleClickIconEye = jest.fn(bill.handleClickIconEye);
        eyeIcon.addEventListener("click", handleClickIconEye(eyeIcon));
        fireEvent.click(eyeIcon);

        expect(handleClickIconEye).toHaveBeenCalled();
        expect(modal).toBeTruthy();
      });
    });

    describe("And I click on the New Bill Button", () => {
      test("Then the New Bill Page should open", () => {
        document.body.innerHTML = BillsUI({ data: bills });

        const newBillButton = screen.getByTestId("btn-new-bill");

        const bill = new Bills({
          document,
          onNavigate,
          mockStore,
          localStorage,
        });

        const handleClickNewBill = jest.fn(bill.handleClickNewBill);
        newBillButton.addEventListener("click", handleClickNewBill);
        fireEvent.click(newBillButton);

        // expect(newBillButton).toBeTruthy();
        expect(handleClickNewBill).toHaveBeenCalled();
        // expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
      });
    });

    describe("And there are no bills", () => {
      test("Then no bills should be shown", () => {
        document.body.innerHTML = BillsUI({ data: [] });

        const anyBill = screen.queryByTestId("bill");
        expect(anyBill).toBeNull();
      });
    });

    describe("And it is loading", () => {
      test("Then Loading page should be rendered", () => {
        document.body.innerHTML = BillsUI({ loading: true });

        expect(screen.getAllByText("Loading...")).toBeTruthy();
      });
    });

    // Test d'intégration GET
    test("Then the bills should be fetched from mock API GET", async () => {
      document.body.innerHTML = BillsUI({ data: bills });

      await waitFor(() => screen.getByText("Mes notes de frais"));
      const mockedBills = await mockStore.bills().list();

      const mockedBillsIds = [];
      mockedBills.forEach((bill) => {
        mockedBillsIds.push(bill.id);
      });

      expect(mockedBills.length).toBe(4);
      expect(mockedBillsIds).toStrictEqual([
        "47qAXb6fIm2zOKkLzMro",
        "BeKy5Mo4jkmdfPGYpTxZ",
        "UIUZtnPQvnbFnB0ozvJh",
        "qcCK3SzECmaZAGRrHjaC",
      ]);
    });

    test("Then the bills fetched from mock API GET should be displayed", async () => {
      document.body.innerHTML = BillsUI({ data: bills });

      await waitFor(() => screen.getByText("Mes notes de frais"));
      const billsContainer = await screen.getByTestId("tbody");
      const mockedBills = await mockStore.bills().list();

      const firstMockedBill = mockedBills[0].type;
      const secondMockedBill = mockedBills[1].name;
      const thirdMockedBill = mockedBills[2].type;
      const fourthMockedBill = mockedBills[3].name;

      expect(billsContainer.innerHTML).toMatch(firstMockedBill);
      expect(billsContainer.innerHTML).toMatch(secondMockedBill);
      expect(billsContainer.innerHTML).toMatch(thirdMockedBill);
      expect(billsContainer.innerHTML).toMatch(fourthMockedBill);
    });
    describe("And an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills");
      });

      describe("With 404 message error", () => {
        test("Then a 404 error message should be displayed", async () => {
          mockStore.bills.mockImplementationOnce(() => {
            return {
              list: () => {
                return Promise.reject(new Error("Erreur 404"));
              },
            };
          });

          window.onNavigate(ROUTES_PATH.Bills);
          await new Promise(process.nextTick);

          document.body.innerHTML = BillsUI({ error: "Erreur 404" });
          const message = await screen.getByText(/Erreur 404/);
          expect(message).toBeTruthy();
        });
      });

      describe("With 500 message error", () => {
        test("Then a 500 error message should be displayed", async () => {
          mockStore.bills.mockImplementationOnce(() => {
            return {
              list: () => {
                return Promise.reject(new Error("Erreur 500"));
              },
            };
          });

          window.onNavigate(ROUTES_PATH.Bills);
          await new Promise(process.nextTick);

          document.body.innerHTML = BillsUI({ error: "Erreur 500" });
          const message = await screen.getByText(/Erreur 500/);
          expect(message).toBeTruthy();
        });
      });
    });
  });
});
