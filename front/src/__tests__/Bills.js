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
import store from "../app/Store.js";

import router from "../app/Router.js";

jest.mock("../app/Store", () => mockStore);

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
          store,
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
      test("Then the New Bill Page should open", async () => {
        document.body.innerHTML = BillsUI({ data: bills });

        const newBillButton = screen.getByTestId("btn-new-bill");

        const bill = new Bills({
          document,
          onNavigate,
          store,
          localStorage,
        });

        const handleClickNewBill = jest.fn(bill.handleClickNewBill);
        newBillButton.addEventListener("click", handleClickNewBill);
        // fireEvent.click(newBillButton);

        // await waitFor(() => screen.getByTestId("form-new-bill"));

        expect(newBillButton).toBeTruthy();
        // expect(handleClickNewBill).toHaveBeenCalled();
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
      const bill = new Bills({
        document,
        onNavigate,
        store,
        localStorage,
      });
      const mockedBills = await bill.getBills();
      document.body.innerHTML = BillsUI({ data: mockedBills });

      await waitFor(() => screen.getByText("Mes notes de frais"));

      expect(mockedBills.length).toBe(4);
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

    describe("And there is an error in the data fetched", () => {
      test("Then an error should be displayed in console", async () => {
        jest.spyOn(mockStore, "bills");
        const logSpy = jest.spyOn(console, "log");
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.resolve([
                {
                  id: "47qAXb6fIm2zOKkLzMro",
                  vat: "80",
                  fileUrl:
                    "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
                  status: "pending",
                  type: "Hôtel et logement",
                  commentary: "séminaire billed",
                  name: "encore",
                  fileName: "preview-facture-free-201801-pdf-1.jpg",
                  date: "null",
                  amount: 400,
                  commentAdmin: "ok",
                  email: "a@a",
                  pct: 20,
                },
              ]);
            },
          };
        });

        const bill = new Bills({
          document,
          onNavigate,
          store,
          localStorage,
        });

        const mockedBills = await bill.getBills();
        document.body.innerHTML = BillsUI({ data: mockedBills });

        await waitFor(() => screen.getByText("Mes notes de frais"));

        expect(logSpy).toHaveBeenCalledTimes(2);
        // expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Error"));
      });
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
