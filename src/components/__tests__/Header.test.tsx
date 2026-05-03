import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import Header from "../Header";

const originalInnerWidth = window.innerWidth;

const setWindowWidth = (width: number) => {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: width,
  });

  window.dispatchEvent(new Event("resize"));
};

describe("Header responsive behavior", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
    window.dispatchEvent(new Event("resize"));
  });

  it("renders a top-level banner landmark for header accessibility", () => {
    render(<Header />);

    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  it("keeps the header landmark available on small viewport widths", () => {
    setWindowWidth(375);
    render(<Header />);

    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  it("keeps the header landmark available on medium viewport widths", () => {
    setWindowWidth(640);
    render(<Header />);

    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  it("keeps the header landmark available on large viewport widths", () => {
    setWindowWidth(1024);
    render(<Header />);

    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  it("opens and closes the hamburger menu when clicking the toggle button", () => {
    setWindowWidth(375);
    render(<Header />);

    const menuButton = screen.getByRole("button", { name: /menu/i });

    expect(menuButton).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(menuButton);
    expect(menuButton).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(menuButton);
    expect(menuButton).toHaveAttribute("aria-expanded", "false");
  });

  it("toggles hamburger menu state correctly across repeated clicks", () => {
    setWindowWidth(375);
    render(<Header />);

    const menuButton = screen.getByRole("button", { name: /menu/i });

    expect(menuButton).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(menuButton); // 1 -> open
    expect(menuButton).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(menuButton); // 2 -> close
    expect(menuButton).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(menuButton); // 3 -> open
    expect(menuButton).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(menuButton); // 4 -> close
    expect(menuButton).toHaveAttribute("aria-expanded", "false");
  });

  it("does not throw JavaScript errors when interacting with the hamburger menu button", () => {
    setWindowWidth(375);
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    render(<Header />);

    const menuButton = screen.getByRole("button", { name: /menu/i });

    expect(() => fireEvent.click(menuButton)).not.toThrow();
    expect(() => fireEvent.click(menuButton)).not.toThrow();
    expect(() => fireEvent.click(menuButton)).not.toThrow();

    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });
});