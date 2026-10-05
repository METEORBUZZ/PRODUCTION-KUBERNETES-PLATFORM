#!/usr/bin/env python3
"""Update the production Helm chart's ECR image references and immutable tag."""

import argparse
from pathlib import Path
import re


def update_values(contents: str, registry: str, tag: str) -> str:
    registry = registry.rstrip("/")
    lines = contents.splitlines(keepends=True)
    image_start = next(
        (index for index, line in enumerate(lines) if line.rstrip("\r\n") == "image:"),
        None,
    )
    if image_start is None:
        raise ValueError("Could not find the top-level image section in Helm values")

    image_end = next(
        (
            index
            for index in range(image_start + 1, len(lines))
            if lines[index].strip() and not lines[index][0].isspace()
        ),
        len(lines),
    )

    for component in ("backend", "frontend"):
        component_start = next(
            (
                index
                for index in range(image_start + 1, image_end)
                if lines[index].rstrip("\r\n") == f"  {component}:"
            ),
            None,
        )
        if component_start is None:
            raise ValueError(f"Could not find image.{component} in Helm values")

        component_end = next(
            (
                index
                for index in range(component_start + 1, image_end)
                if re.match(r"^  [A-Za-z0-9_-]+:\s*(?:#.*)?(?:\r?\n)?$", lines[index])
            ),
            image_end,
        )

        repository_lines = [
            index
            for index in range(component_start + 1, component_end)
            if re.match(r"^    repository:\s*", lines[index])
        ]
        tag_lines = [
            index
            for index in range(component_start + 1, component_end)
            if re.match(r"^    tag:\s*", lines[index])
        ]
        if len(repository_lines) != 1 or len(tag_lines) != 1:
            raise ValueError(
                f"Expected one repository and tag under image.{component}"
            )

        repository = f"catdog-platform-{component}"
        lines[repository_lines[0]] = (
            f"    repository: {registry}/{repository}\n"
        )
        lines[tag_lines[0]] = f'    tag: "{tag}"\n'

    return "".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--values", required=True, type=Path)
    parser.add_argument("--registry", required=True)
    parser.add_argument("--tag", required=True)
    args = parser.parse_args()

    updated = update_values(
        args.values.read_text(encoding="utf-8"),
        args.registry.rstrip("/"),
        args.tag,
    )
    args.values.write_text(updated, encoding="utf-8")


if __name__ == "__main__":
    main()
