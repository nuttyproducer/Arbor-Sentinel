import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { Header } from "../Header";

function renderHeader(initialRoute = "/") {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Header />
    </MemoryRouter>,
  );
}

describe("Header", () => {
  it("renders the logo and wordmark", () => {
    renderHeader();
    expect(screen.getByText("Accountability Atlas")).toBeInTheDocument();
    expect(
      screen.getByText("Civic Accountability Platform"),
    ).toBeInTheDocument();
  });

  it("renders the home link with accessible label", () => {
    renderHeader();
    const homeLink = screen.getByLabelText(
      "Accountability Atlas — Home",
    );
    expect(homeLink).toBeInTheDocument();
    expect(homeLink.getAttribute("href")).toBe("/");
  });

  it("renders desktop navigation items", () => {
    renderHeader();
    // Desktop nav only — scope to the desktop nav container
    const desktopNav = screen.getByRole("navigation", { name: "Main navigation" });
    expect(desktopNav).toBeInTheDocument();
  });

  it("renders GitHub external link in desktop nav", () => {
    renderHeader();
    const desktopNav = screen.getByRole("navigation", { name: "Main navigation" });
    const ghLink = desktopNav.querySelector('a[href*="github.com"]');
    expect(ghLink).toHaveAttribute(
      "href",
      "https://github.com/nuttyproducer/accountability-atlas",
    );
  });

  it("shows 'Menu' button on mobile by default", () => {
    renderHeader();
    const btn = screen.getByText("Menu");
    expect(btn).toBeInTheDocument();
    expect(btn.getAttribute("aria-expanded")).toBe("false");
  });

  it("toggles to 'Close' when mobile menu is opened", async () => {
    renderHeader();
    const user = userEvent.setup();
    const btn = screen.getByText("Menu");

    await user.click(btn);
    expect(screen.getByText("Close")).toBeInTheDocument();
    expect(btn.getAttribute("aria-expanded")).toBe("true");
  });

  it("renders mobile nav links when menu is open", async () => {
    renderHeader();
    const user = userEvent.setup();

    await user.click(screen.getByText("Menu"));

    // Mobile nav should now be visible; links should exist
    const mobileLinks = screen.getAllByText("Gaza Dossier");
    expect(mobileLinks.length).toBeGreaterThanOrEqual(2); // desktop + mobile
  });

  it("highlights active nav item based on current route", () => {
    renderHeader("/methodology");
    // The active Methodology link should have darker text color
    const links = screen.getAllByText("Methodology");
    // At least one should have the active class (text-ink vs text-charcoal)
    const activeLink = links.find((l) =>
      l.className.includes("text-ink"),
    );
    expect(activeLink).toBeInTheDocument();
  });
});
