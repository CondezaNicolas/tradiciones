"use client";

import type { IconType } from "react-icons";
import {
  MdAdd,
  MdAutoStories,
  MdChevronRight,
  MdCloudUpload,
  MdDelete,
  MdEdit,
  MdSave,
  MdVisibility,
} from "react-icons/md";

export const MATERIAL_ICONS = {
  add: MdAdd,
  autoStories: MdAutoStories,
  chevronRight: MdChevronRight,
  cloudUpload: MdCloudUpload,
  delete: MdDelete,
  edit: MdEdit,
  save: MdSave,
  visibility: MdVisibility,
} as const;

interface MaterialIconProps {
  className?: string;
  name: IconType;
}

export function MaterialIcon({ className, name }: MaterialIconProps) {
  const Icon = name;

  return (
    <Icon
      aria-hidden="true"
      className={["inline-flex shrink-0 leading-none", className].filter(Boolean).join(" ")}
      focusable="false"
    />
  );
}
