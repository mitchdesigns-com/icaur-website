import { useState } from "react";

/* ─── Styles ─────────────────────────────────────────────────── */
const css = `
  .mc-label {
    font-size: .65rem;
    font-weight: 700;
    letter-spacing: .22em;
    text-transform: uppercase;
    color: rgba(0,0,0,.35);
    margin: 0 0 12px;
    display: block;
  }

  .mc-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .mc-item {
    position: relative;
    cursor: pointer;
    display: block;
    margin: 0;
  }

  .mc-item input[type="radio"] {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
    pointer-events: none;
  }

  .mc-img-wrap {
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    aspect-ratio: 3 / 2;
    background: #F0EDE8;
    border: 2px solid transparent;
    transition: border-color .25s;
  }

  .mc-item:hover .mc-img-wrap img {
    transform: scale(1.04);
  }

  .mc-img-wrap img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform .5s cubic-bezier(.25,.46,.45,.94);
    display: block;
  }

  .mc-name {
    position: absolute;
    bottom: 12px;
    left: 14px;
    font-size: 1.1rem;
    font-weight: 800;
    letter-spacing: .04em;
    text-transform: uppercase;
    color: #fff;
    text-shadow: 0 1px 6px rgba(0,0,0,.4);
    transition: color .25s;
  }

  .mc-dot {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid rgba(0,0,0,.18);
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    color: transparent;
    transition: border-color .25s, background .25s, color .25s;
  }

  /* Checked state */
  .mc-item.is-checked .mc-img-wrap {
    border-color: #F37021;
  }
  .mc-item.is-checked .mc-dot {
    background: #F37021;
    border-color: #F37021;
    color: #fff;
  }
`;

/* ─── Default models ──────────────────────────────────────────── */
const DEFAULT_MODELS = [
  {
    value: "v27",
    label: "V27",
    image: "/assets/images/v27-model-in-homepge-01.png",
    alt: "iCAUR V27",
  },
  {
    value: "ot3",
    label: "OT3",
    image: "/assets/images/ot3-model-in-homepage-01.png",
    alt: "iCAUR OT3",
  },
];

/* ─── Component ───────────────────────────────────────────────── */
/**
 * ModelChooser
 *
 * Props:
 *   models      — array of { value, label, image, alt }   (optional, uses iCAUR defaults)
 *   defaultValue — initially selected model value          (default: first item)
 *   label       — section label text above the grid        (default: "Choose Model")
 *   name        — radio group name attribute               (default: "model")
 *   onChange    — (value: string) => void                  (optional)
 */
export default function ModelChooser({
  models = DEFAULT_MODELS,
  defaultValue,
  label = "Choose Model",
  name = "model",
  onChange,
}) {
  const [selected, setSelected] = useState(defaultValue ?? models[0]?.value);

  function handleChange(value) {
    setSelected(value);
    onChange?.(value);
  }

  return (
    <>
      <style>{css}</style>

      <div>
        {label && <p className="mc-label">{label}</p>}

        <div className="mc-grid" role="radiogroup" aria-label="Select a model">
          {models.map((model) => {
            const checked = selected === model.value;
            return (
              <label
                key={model.value}
                className={`mc-item${checked ? " is-checked" : ""}`}
              >
                <input
                  type="radio"
                  name={name}
                  value={model.value}
                  checked={checked}
                  aria-label={model.label}
                  onChange={() => handleChange(model.value)}
                />
                <div className="mc-img-wrap">
                  <img src={model.image} alt={model.alt} loading="eager" />
                  <span className="mc-name">{model.label}</span>
                  <span className="mc-dot" aria-hidden="true">
                    <svg width="10" height="10" viewBox="0 0 10 10">
                      <circle cx="5" cy="5" r="4" fill="currentColor" />
                    </svg>
                  </span>
                </div>
              </label>
            );
          })}
        </div>
      </div>
    </>
  );
}
